import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RewardTable } from '@/components/admin/RewardTable';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

// Mock data - replace with actual data from your API
const stats = [
  { name: 'Total Rewards', value: '1,234', change: '+12% from last month' },
  { name: 'Active Rewards', value: '89', change: '+5% from last month' },
  { name: 'Claims Today', value: '42', change: '+8% from yesterday' },
  { name: 'Total Users', value: '5,678', change: '+23% from last month' },
];

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1000 },
];

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:ml-64">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's what's happening with your rewards.</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Reward
          </Button>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.name}</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Monthly Claims</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium leading-none truncate">Reward claimed by user</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-base sm:text-lg">Recent Rewards</CardTitle>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <RewardTable />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
