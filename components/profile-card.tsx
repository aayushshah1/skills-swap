// // components/profile-card.tsx
// 'use client';

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar } from "@/components/ui/avatar";

// type ProfileCardProps = {
//   uid: string;
//   name: string;
//   photoUrl?: string;
//   skillsOffered: string[];
//   skillsWanted: string[];
//   rating?: number; // optional for now
//   onRequest: () => void;
// };

// export default function ProfileCard({
//   uid,
//   name,
//   photoUrl = "/default-user.png",
//   skillsOffered,
//   skillsWanted,
//   rating,
//   onRequest,
// }: ProfileCardProps) {
//   return (
//     <Card>
//       <CardContent className="p-4 flex flex-col gap-3">
//         <div className="flex items-center gap-4">
//           <Avatar>
//             <img src={photoUrl} alt={`${name}'s avatar`} className="rounded-full w-10 h-10" />
//           </Avatar>
//           <div>
//             <p className="font-semibold">{name}</p>
//             {rating !== undefined && (
//               <p className="text-sm text-gray-500">⭐ {rating.toFixed(1)}</p>
//             )}
//           </div>
//         </div>

//         <div>
//           <p className="text-sm font-medium">Offers:</p>
//           <div className="flex flex-wrap gap-2 text-sm text-blue-600">
//             {skillsOffered.map((s) => <span key={s}>#{s}</span>)}
//           </div>
//         </div>

//         <div>
//           <p className="text-sm font-medium">Wants:</p>
//           <div className="flex flex-wrap gap-2 text-sm text-green-600">
//             {skillsWanted.map((s) => <span key={s}>#{s}</span>)}
//           </div>
//         </div>

//         <Button onClick={onRequest}>Request Swap</Button>
//       </CardContent>
//     </Card>
//   );
// }


'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

type ProfileCardProps = {
  profile: {
    uid: string;
    display_name: string;
    photo_url?: string;
    skills_offered?: string[];
    skills_wanted?: string[];
    availability?: string;
    rating?: number;
  };
  onRequestClick: () => void;
};

export default function ProfileCard({ profile, onRequestClick }: ProfileCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <Avatar>
            <img
              src={profile.photo_url || "/default-user.png"}
              alt="Profile"
              className="rounded-full w-10 h-10"
            />
          </Avatar>
          <div>
            <p className="font-semibold">{profile.display_name}</p>
            {profile.rating && (
              <p className="text-sm text-gray-500">⭐ {profile.rating.toFixed(1)}</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Offers:</p>
          <div className="flex flex-wrap gap-2 text-sm text-blue-600">
            {(profile.skills_offered || []).map((skill) => (
              <span key={skill}>#{skill}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Wants:</p>
          <div className="flex flex-wrap gap-2 text-sm text-green-600">
            {(profile.skills_wanted || []).map((skill) => (
              <span key={skill}>#{skill}</span>
            ))}
          </div>
        </div>

        <Button onClick={onRequestClick}>Request Swap</Button>
      </CardContent>
    </Card>
  );
}
