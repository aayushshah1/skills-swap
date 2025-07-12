import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

interface ProfileCompletionPromptProps {
  userProfile: {
    location: string | null;
    availability: string[] | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export function ProfileCompletionPrompt({ userProfile }: ProfileCompletionPromptProps) {
  const missingFields = [];
  
  if (!userProfile.location) missingFields.push("Location");
  if (!userProfile.availability || userProfile.availability.length === 0) missingFields.push("Availability");
  if (!userProfile.first_name || !userProfile.last_name) missingFields.push("Name");

  if (missingFields.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg text-orange-800">
            Complete Your Profile
          </CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          To get the best skill swap matches, please complete your profile by adding the missing information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-orange-700 font-medium">Missing information:</p>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((field) => (
              <div key={field} className="flex items-center space-x-1 text-sm text-orange-600">
                {field === "Location" && <MapPin className="h-3 w-3" />}
                {field === "Availability" && <Calendar className="h-3 w-3" />}
                {field === "Name" && <User className="h-3 w-3" />}
                <span>{field}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/profile">
          <Button className="w-full bg-orange-600 hover:bg-orange-700">
            Complete Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
