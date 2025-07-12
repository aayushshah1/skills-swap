import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfileCard({ profile, onRequestClick }: {
  profile: any;
  onRequestClick: () => void;
}) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <img
          src={profile.image || "/default-user.png"}
          alt="profile"
          className="w-12 h-12 rounded-full"
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
          <span>{profile.availability || 'N/A'}</span>
        </div>
        {/* optional rating */}
        {profile.rating && (
          <div>
            <strong>Rating:</strong> ⭐ {profile.rating.toFixed(1)}
          </div>
        )}
        <Button className="w-full" onClick={onRequestClick}>
          Request Skill Swap
        </Button>
      </CardContent>
    </Card>
  );
}
