import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  period: string;
  icon: "calendar" | "users" | "dollar" | "trending-up";
}

const icons = {
  calendar: Calendar,
  users: Users,
  dollar: DollarSign,
  "trending-up": TrendingUp,
};

export default function StatsCard({
  title,
  value,
  change,
  period,
  icon,
}: StatsCardProps) {
  const Icon = icons[icon];
  const isPositive = change.startsWith("+");
  const changeColor = isPositive ? "text-green-500" : "text-red-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-blue-100 p-1.5">
          <Icon className="h-full w-full text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span className={changeColor}>{change}</span> {period}
        </p>
      </CardContent>
    </Card>
  );
}
