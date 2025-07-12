import { createClient } from '@/utils/supabase/server';
import { fetchOwnUserProfile } from '@/app/fetch';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userProfile = await fetchOwnUserProfile();

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <p className="text-sm text-muted-foreground">{userProfile?.first_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <p className="text-sm text-muted-foreground">{userProfile?.last_name || 'Not set'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <p className="text-sm text-muted-foreground">{userProfile?.location || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Profile Visibility</label>
              <p className="text-sm text-muted-foreground">
                {userProfile?.public ? 'Public' : 'Private'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Settings functionality will be implemented in future updates. 
            For now, you can update your profile information from the Profile page.
          </p>
        </div>
      </div>
    </div>
  );
}
