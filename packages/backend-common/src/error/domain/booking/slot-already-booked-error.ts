// domain/booking/slot-already-booked-error.ts

import { HttpError } from '../../base/http-error';
import { StatusCodes } from 'http-status-codes';

export class SlotAlreadyBookedError extends HttpError {
  constructor(slotId: string) {
    super(StatusCodes.CONFLICT, 'Slot already booked', {
      errorCode: 'SLOT_ALREADY_BOOKED',
      details: { slotId },
    });
  }
}
