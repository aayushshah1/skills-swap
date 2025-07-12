"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/app/actions";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const userRole = searchParams.get("user_role") || "unknown";
  const pathTried = searchParams.get("path_tried") || "unknown";
  const correctRole = searchParams.get("correct_role") || "admin";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            Access Denied
          </CardTitle>
          <CardDescription className="text-center">
            You don&apos;t have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              You are logged in as a <span className="font-semibold">{userRole}</span>. 
              You cannot access <span className="font-semibold">/{pathTried}</span>. 
              Log in again with a <span className="font-semibold">{correctRole}</span> account.
            </p>
          </div>
          
          <Button 
            onClick={handleLogout} 
            className="w-full"
            variant="destructive"
          >
            Log Out & Sign In Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-center">
              Loading...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
