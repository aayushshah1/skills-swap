import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwapRequestCard } from "@/components/ui/dashboard-card";
import { ProfileCompletionPrompt } from "@/components/ui/profile-completion-prompt";
import { fetchOwnUserProfile, fetchPublicSwapRequests, fetchUserStats } from "@/app/fetch";
import { Plus, TrendingUp, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function UserDashboard() {
    const supabase = await createClient();

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
        redirect("/login");
    }

    const { email } = session.user;

    // Fetch user data
    const userProfile = await fetchOwnUserProfile();
    const publicSwapRequests = await fetchPublicSwapRequests(6);
    const userStats = await fetchUserStats();

    // Get greeting based on time of day
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    if (hour >= 17) greeting = "Good evening";

    const userName = userProfile?.display_name || 
        `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 
        email?.split('@')[0] || 'there';

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Welcome Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {greeting}, {userName}! 👋
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Ready to swap some skills today? Discover new opportunities and share your expertise.
                            </p>
                        </div>
                        <Link href="/swap/create">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-5 w-5 mr-2" />
                                Create Swap Request
                            </Button>
                        </Link>
                    </div>

                    {/* Profile Completion Prompt */}
                    {userProfile && (
                        <ProfileCompletionPrompt userProfile={userProfile} />
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.totalRequests}</div>
                                <p className="text-xs text-muted-foreground">
                                    Swap requests created
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Swaps</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.completedSwaps}</div>
                                <p className="text-xs text-muted-foreground">
                                    Successful skill exchanges
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.pendingRequests}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting responses
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userStats.rating.toFixed(1)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Out of 5.0 stars
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Swap Requests */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Available Skill Swaps</h2>
                            <p className="text-gray-600">
                                Discover new opportunities from the community
                            </p>
                        </div>
                        <Link href="/swap/browse">
                            <Button variant="outline">
                                View All
                            </Button>
                        </Link>
                    </div>

                    {publicSwapRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicSwapRequests.map((request) => (
                                <SwapRequestCard key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <CardTitle className="text-lg text-gray-600 mb-2">
                                    No swap requests available
                                </CardTitle>
                                <CardDescription>
                                    Be the first to create a swap request and start building the community!
                                </CardDescription>
                                <Link href="/swap/create">
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Swap
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/profile">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-lg">Edit Profile</CardTitle>
                                    <CardDescription>
                                        Update your information and skills
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Link href="/swap/my-requests">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-lg">My Requests</CardTitle>
                                    <CardDescription>
                                        View and manage your swap requests
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Link href="/swap/browse">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-lg">Browse Swaps</CardTitle>
                                    <CardDescription>
                                        Find skills you want to learn
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
