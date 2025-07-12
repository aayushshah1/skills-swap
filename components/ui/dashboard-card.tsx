import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Clock, User } from "lucide-react";

interface SwapRequestCardProps {
  request: {
    id: number;
    skill_offered: string;
    skill_requested: string;
    description: string | null;
    created_at: string;
    requester: {
      uid: string;
      first_name: string | null;
      last_name: string | null;
      display_name: string | null;
      location: string | null;
      availability: string[] | null;
      photo_url: string | null;
    };
  };
}

export function SwapRequestCard({ request }: SwapRequestCardProps) {
  const requesterName = request.requester.display_name || 
    `${request.requester.first_name || ''} ${request.requester.last_name || ''}`.trim() || 
    'Anonymous User';

  const timeAgo = new Date(request.created_at).toLocaleDateString();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.requester.photo_url || undefined} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{requesterName}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {timeAgo}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Offering:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {request.skill_offered}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Requesting:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {request.skill_requested}
            </Badge>
          </div>
        </div>
        
        {request.description && (
          <CardDescription className="text-sm">
            {request.description}
          </CardDescription>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {request.requester.location && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {request.requester.location}
              </div>
            )}
            {request.requester.availability && request.requester.availability.length > 0 && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {request.requester.availability.join(', ')}
              </div>
            )}
          </div>
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
