"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Menu, Search, UserPlus } from "lucide-react";
import AdminSidebar from "../../../components/venue-admin/sidebar";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  status: "Active" | "Inactive";
}

const CUSTOMERS_PER_PAGE = 5;

export default function CustomersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data
  const allCustomers: Customer[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `John Doe ${i + 1}`,
    email: `john.doe${i + 1}@example.com`,
    phone: `+1 234 567 ${i.toString().padStart(3, "0")}`,
    totalBookings: Math.floor(Math.random() * 20) + 1,
    status: Math.random() > 0.1 ? "Active" : "Inactive",
  }));

  // Filter customers based on search term
  const filteredCustomers = allCustomers.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginate customers
  const totalPages = Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * CUSTOMERS_PER_PAGE,
    currentPage * CUSTOMERS_PER_PAGE
  );

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="flex min-h-screen bg-white">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        <SheetContent side="left" className="w-[240px] p-0">
          <AdminSidebar />
        </SheetContent>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-white">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6">
              <div className="flex items-center gap-4">
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <h1 className="text-xl font-semibold">Customers</h1>
              </div>
              <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button className="bg-[#0F172A] hover:bg-[#0F172A]/90">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </div>
            </div>
          </header>

          {/* Table */}
          <div className="p-4">
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Total Bookings
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b">
                        <td className="px-4 py-3 text-sm">{customer.name}</td>
                        <td className="px-4 py-3 text-sm">{customer.email}</td>
                        <td className="px-4 py-3 text-sm">{customer.phone}</td>
                        <td className="px-4 py-3 text-sm">
                          {customer.totalBookings}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${customer.status === "Active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                              }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * CUSTOMERS_PER_PAGE + 1} to{" "}
                  {Math.min(
                    currentPage * CUSTOMERS_PER_PAGE,
                    filteredCustomers.length
                  )}{" "}
                  of {filteredCustomers.length} entries
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
