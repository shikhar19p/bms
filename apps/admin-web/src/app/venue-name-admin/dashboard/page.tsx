import { Search } from "lucide-react";
import StatsCard from "../../../components/venue-admin/stats-card";
import BookingsTable from "../../../components/venue-admin/bookings-table";
import AdminSidebar from "../../../components/venue-admin/sidebar";
import { Input } from "@workspace/ui/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";

export default function GroundsAdminDashboard() {
  const stats = [
    {
      title: "Total Bookings",
      value: "1,234",
      change: "+12%",
      period: "this month",
      icon: "calendar",
    },
    {
      title: "Active Users",
      value: "892",
      change: "+5%",
      period: "this month",
      icon: "users",
    },
    {
      title: "Revenue",
      value: "$12,345",
      change: "+8%",
      period: "this month",
      icon: "dollar",
    },
    {
      title: "Utilization",
      value: "76%",
      change: "+3%",
      period: "this month",
      icon: "trending-up",
    },
  ];

  const recentBookings = [
    {
      customer: "John Doe",
      sport: "Football",
      timeSlot: "10:00 AM - 11:00 AM",
      status: "confirmed",
    },
    {
      customer: "Jane Smith",
      sport: "Tennis",
      timeSlot: "2:00 PM - 3:00 PM",
      status: "pending",
    },
  ] as Booking[];

  type Booking = {
    customer: string;
    sport: string;
    timeSlot: string;
    status: "confirmed" | "pending" | "cancelled";
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="border-b">
            <div className="flex h-16 items-center px-4 gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <AdminSidebar />
                </SheetContent>
              </Sheet>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    2
                  </div>
                  <button className="rounded-full bg-muted p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JA</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">John Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} icon={stat.icon as "calendar" | "users" | "dollar" | "trending-up"} />
              ))}
            </div>
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-xl font-semibold">Recent Bookings</h2>
              </div>
              <BookingsTable bookings={recentBookings} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
