import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";

interface Booking {
  customer: string;
  sport: string;
  timeSlot: string;
  status: "confirmed" | "pending" | "cancelled";
}

interface BookingsTableProps {
  bookings: Booking[];
}

const statusStyles = {
  confirmed: "bg-green-100 text-green-800 hover:bg-green-100",
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

export default function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Time Slot</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{booking.customer}</TableCell>
              <TableCell>{booking.sport}</TableCell>
              <TableCell>{booking.timeSlot}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusStyles[booking.status]}
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
