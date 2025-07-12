import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { PublicUserProfile } from "@/types/supabase";

export default function ProfileCard({ profile, onRequestClick }: {
  profile: PublicUserProfile;
  onRequestClick: () => void;
}) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Image
          src={profile.photo_url || "/default-user.png"}
          alt="profile"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.location}</p>
        </div>
      </div>

      <CardContent className="space-y-2 p-0">
        <div>
          <strong>Skills Offered:</strong>{" "}
          <span>{(profile.skills_offered || []).join(', ')}</span>
        </div>
        <div>
          <strong>Skills Wanted:</strong>{" "}
          <span>{(profile.skills_wanted || []).join(', ')}</span>
        </div>
        <div>
          <strong>Availability:</strong>{" "}
          <span>{profile.availability?.join(', ') || 'N/A'}</span>
        </div>
        {/* Show completed swaps instead of rating */}
        {profile.completed_swaps > 0 && (
          <div>
            <strong>Completed Swaps:</strong> {profile.completed_swaps}
          </div>
        )}
        <Button className="w-full" onClick={onRequestClick}>
          Request Skill Swap
        </Button>
      </CardContent>
    </Card>
  );
}
