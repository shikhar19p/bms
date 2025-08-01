"use client";

import type React from "react";

import { Filter, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";

const groundAdmins = [
  {
    id: 1,
    fullName: "John Admin",
    businessName: "Verdant Gardens",
    email: "john15548@gmail.com",
    phone: "+91 8639211485",
  },
  {
    id: 2,
    fullName: "Jaiden Nixon",
    businessName: "Ember Creative",
    email: "jaiden.n@gmail.com",
    phone: "+91 8949866541",
  },
  {
    id: 3,
    fullName: "Ace Foley",
    businessName: "Pulse Tech",
    email: "ace.fol@yahoo.com",
    phone: "+91 9847899868",
  },
  {
    id: 4,
    fullName: "Nikolai Schmidt",
    businessName: "Harmony Wellness",
    email: "nikolai.schmidt1994@outlook.com",
    phone: "+91 8899663355",
  },
  {
    id: 5,
    fullName: "Clayton Charles",
    businessName: "Echo Media",
    email: "me@clayton.com",
    phone: "+91 8188554477",
  },
  {
    id: 6,
    fullName: "Prince Chen",
    businessName: "Verdant Gardens",
    email: "prince.chen1997@gmail.com",
    phone: "+91 9988774568",
  },
  {
    id: 7,
    fullName: "Reece Duran",
    businessName: "Axiom Designs",
    email: "reece@yahoo.com",
    phone: "+91 8866248895",
  },
  {
    id: 8,
    fullName: "Anastasia Mcdaniel",
    businessName: "Serene Spa Retreat",
    email: "anastasia.spring@mcdaniel12.com",
    phone: "+91 8877456358",
  },
  {
    id: 9,
    fullName: "Melvin Boyle",
    businessName: "Nova Fitness",
    email: "Me.boyle@gmail.com",
    phone: "+91 9948668896",
  },
  {
    id: 10,
    fullName: "Kailee Thomas",
    businessName: "Pulse Tech",
    email: "Kailee.thomas@gmail.com",
    phone: "+91 9948668897",
  },
  {
    id: 11,
    fullName: "Raj Sharma",
    businessName: "Fitness Hub",
    email: "raj.sharma@gmail.com",
    phone: "+91 9876543210",
  },
  {
    id: 12,
    fullName: "Priya Patel",
    businessName: "Sports Arena",
    email: "priya.patel@gmail.com",
    phone: "+91 9876543211",
  },
  {
    id: 13,
    fullName: "Amit Kumar",
    businessName: "Cricket Academy",
    email: "amit.kumar@gmail.com",
    phone: "+91 9876543212",
  },
  {
    id: 14,
    fullName: "Sneha Reddy",
    businessName: "Tennis Club",
    email: "sneha.reddy@gmail.com",
    phone: "+91 9876543213",
  },
  {
    id: 15,
    fullName: "Vikram Singh",
    businessName: "Football Ground",
    email: "vikram.singh@gmail.com",
    phone: "+91 9876543214",
  },
  {
    id: 16,
    fullName: "Neha Gupta",
    businessName: "Badminton Court",
    email: "neha.gupta@gmail.com",
    phone: "+91 9876543215",
  },
  {
    id: 17,
    fullName: "Rahul Verma",
    businessName: "Swimming Pool",
    email: "rahul.verma@gmail.com",
    phone: "+91 9876543216",
  },
  {
    id: 18,
    fullName: "Ananya Sharma",
    businessName: "Yoga Center",
    email: "ananya.sharma@gmail.com",
    phone: "+91 9876543217",
  },
];

export function VenueAdminList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("top");
  const [city, setCity] = useState("hyderabad");
  const itemsPerPage = 10;

  // Filter admins based on search term, filter, and city
  const filteredAdmins = useMemo(() => {
    let admins = groundAdmins;

    // Filter by city
    if (city) {
      admins = admins.filter((admin) =>
        // Example: filter by businessName containing city (customize as needed)
        admin.businessName.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Filter by filter type (example logic, customize as needed)
    if (filter === "top") {
      admins = admins.slice(0, 10); // Example: top 10 admins
    } else if (filter === "new") {
      admins = admins.slice(-10); // Example: last 10 admins
    } // Add more filter logic as needed

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      admins = admins.filter(
        (admin) =>
          admin.fullName.toLowerCase().includes(searchLower) ||
          admin.businessName.toLowerCase().includes(searchLower) ||
          admin.email.toLowerCase().includes(searchLower) ||
          admin.phone.includes(search)
      );
    }

    return admins;
  }, [search, filter, city]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAdmins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAdmins, currentPage]);

  // Reset to first page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a subset of pages with current page in the middle if possible
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4" />
          NEW GROUND ADMIN
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top Admins</SelectItem>
                <SelectItem value="new">New Admins</SelectItem>
                <SelectItem value="active">Active Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="rounded-md px-2 py-1">
              +8
            </Badge>
          </div>
          <Input
            type="search"
            placeholder="Search..."
            className="md:w-[300px]"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">S.No</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="w-[150px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAdmins.length > 0 ? (
              paginatedAdmins.map((admin, index) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{admin.fullName}</TableCell>
                  <TableCell>{admin.businessName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No ground admins found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredAdmins.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAdmins.length)} of{" "}
            {filteredAdmins.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
