// packages/backend-common/src/logger/transports/file-transport.ts

import { ILogTransport } from "../i-log-transport";
import { FormattedLogPayload } from "../log-formatter";
import {  logLevelToFileName } from "../log-level";
import fs from 'fs/promises'; // For async file operations
import path from 'path';

// Consider using a library like 'winston-daily-rotate-file' or 'log-rotate'
// for robust file rotation in production. This is a simplified example.

/**
 * @class FileTransport
 * @implements ILogTransport
 * @description A log transport that writes formatted log payloads to local files.
 * Supports basic log rotation by level.
 */
export class FileTransport implements ILogTransport {
  private logDirectory: string;
  private maxFileSize: number; // in bytes
  private maxFiles: number; // number of files to keep

  constructor(options?: { logDirectory?: string; maxFileSize?: number; maxFiles?: number }) {
    this.logDirectory = options?.logDirectory || path.join(process.cwd(), 'logs');
    this.maxFileSize = options?.maxFileSize || 10 * 1024 * 1024; // 10 MB
    this.maxFiles = options?.maxFiles || 7; // Keep 7 files

    // Ensure log directory exists
    fs.mkdir(this.logDirectory, { recursive: true }).catch(err => {
      console.error(`FileTransport: Failed to create log directory ${this.logDirectory}:`, err);
    });
  }

  async send(log: FormattedLogPayload): Promise<void> {
    const filename = path.join(this.logDirectory, logLevelToFileName(log.level));
    const logLine = JSON.stringify(log) + '\n'; // Write as JSON line

    try {
      // Basic file size check and rotation (for production, use dedicated libraries)
      let rotate = false;
      try {
        const stats = await fs.stat(filename);
        if (stats.size + Buffer.byteLength(logLine, 'utf8') > this.maxFileSize) {
          rotate = true;
        }
      } catch (statErr: any) {
        if (statErr.code !== 'ENOENT') throw statErr; // Ignore file not found
      }

      if (rotate) {
        await this._rotateFile(filename);
      }

      await fs.appendFile(filename, logLine, 'utf8');
    } catch (error) {
      console.error(`FileTransport: Failed to write log to ${filename}:`, error);
    }
  }

  private async _rotateFile(filename: string): Promise<void> {
    const baseName = path.basename(filename, path.extname(filename));
    const ext = path.extname(filename);

    // Shift existing files
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const oldPath = path.join(this.logDirectory, `${baseName}.${i}${ext}`);
      const newPath = path.join(this.logDirectory, `${baseName}.${i + 1}${ext}`);
      try {
        await fs.rename(oldPath, newPath);
      } catch (err: any) {
        if (err.code !== 'ENOENT') { // Ignore file not found errors during shifting
          console.warn(`FileTransport: Could not rotate file ${oldPath}:`, err);
        }
      }
    }
    // Rename current file to .1
    try {
      await fs.rename(filename, path.join(this.logDirectory, `${baseName}.1${ext}`));
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.warn(`FileTransport: Could not rename current file ${filename}:`, err);
      }
    }
  }
}