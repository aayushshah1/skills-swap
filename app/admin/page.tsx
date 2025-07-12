import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/admin/users-table";
import { SwapRequestsTable } from "@/components/admin/swap-requests-table";
import { fetchAllUsers, fetchAllSwapRequests, fetchAdminStats } from "@/app/fetch";
import { 
  Users, 
  ArrowRightLeft, 
  CheckCircle, 
  Clock, 
  Eye, 
  EyeOff,
  Shield,
  BarChart3
} from "lucide-react";

export default async function AdminDashboard() {
    const supabase = await createClient();

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
        redirect("/login");
    }

    const token = session.access_token;
    const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
    );

    const role = payload.user_role || "user";

    if (role !== "admin") {
        redirect("/unauthorized");
    }

    // Fetch admin data
    const [users, swapRequests, stats] = await Promise.all([
        fetchAllUsers(),
        fetchAllSwapRequests(),
        fetchAdminStats()
    ]);

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Admin Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Shield className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">
                                Manage users, swap requests, and monitor platform activity
                            </p>
                        </div>
                    </div>
                    <Badge variant="destructive" className="text-sm">
                        Admin Access
                    </Badge>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
                            <p className="text-xs text-blue-700">Registered users</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">Public Profiles</CardTitle>
                            <Eye className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{stats.publicProfiles}</div>
                            <p className="text-xs text-green-700">Discoverable profiles</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-800">Private Profiles</CardTitle>
                            <EyeOff className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">{stats.privateProfiles}</div>
                            <p className="text-xs text-orange-700">Private profiles</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-800">Total Swaps</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{stats.totalSwapRequests}</div>
                            <p className="text-xs text-purple-700">All swap requests</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-800">Active Swaps</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-900">{stats.activeSwapRequests}</div>
                            <p className="text-xs text-yellow-700">Pending requests</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-800">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-900">{stats.completedSwapRequests}</div>
                            <p className="text-xs text-emerald-700">Successful swaps</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="users" className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Users Management</span>
                        </TabsTrigger>
                        <TabsTrigger value="swaps" className="flex items-center space-x-2">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span>Swap Requests</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Analytics</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Users Management</span>
                                </CardTitle>
                                <CardDescription>
                                    View, edit, and manage all registered users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UsersTable users={users} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="swaps" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ArrowRightLeft className="h-5 w-5" />
                                    <span>Swap Requests Management</span>
                                </CardTitle>
                                <CardDescription>
                                    Monitor and manage all skill swap requests
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SwapRequestsTable swapRequests={swapRequests} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Activity</CardTitle>
                                    <CardDescription>
                                        Overview of user engagement and activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Public Profiles</span>
                                            <span className="text-sm text-muted-foreground">
                                                {stats.totalUsers > 0 ? Math.round((stats.publicProfiles / stats.totalUsers) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full" 
                                                style={{ width: `${stats.totalUsers > 0 ? (stats.publicProfiles / stats.totalUsers) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Private Profiles</span>
                                            <span className="text-sm text-muted-foreground">
                                                {stats.totalUsers > 0 ? Math.round((stats.privateProfiles / stats.totalUsers) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-orange-600 h-2 rounded-full" 
                                                style={{ width: `${stats.totalUsers > 0 ? (stats.privateProfiles / stats.totalUsers) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Swap Request Status</CardTitle>
                                    <CardDescription>
                                        Distribution of swap request statuses
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Active Requests</span>
                                            <span className="text-sm text-muted-foreground">
                                                {stats.totalSwapRequests > 0 ? Math.round((stats.activeSwapRequests / stats.totalSwapRequests) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-yellow-600 h-2 rounded-full" 
                                                style={{ width: `${stats.totalSwapRequests > 0 ? (stats.activeSwapRequests / stats.totalSwapRequests) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Completed Requests</span>
                                            <span className="text-sm text-muted-foreground">
                                                {stats.totalSwapRequests > 0 ? Math.round((stats.completedSwapRequests / stats.totalSwapRequests) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full" 
                                                style={{ width: `${stats.totalSwapRequests > 0 ? (stats.completedSwapRequests / stats.totalSwapRequests) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
