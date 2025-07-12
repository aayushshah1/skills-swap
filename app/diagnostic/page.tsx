import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DiagnosticPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/login');
  }

  // Test database connection
  let dbConnectionTest = null;
  let dbError: Error | null = null;
  
  try {
    const { error } = await supabase
      .from('user')
      .select('count')
      .limit(1);
    
    if (error) {
      dbError = error as Error;
    } else {
      dbConnectionTest = 'Success';
    }
  } catch (err) {
    dbError = err as Error;
  }

  // Test user profile access
  let userProfileTest = null;
  let profileError: Error | null = null;
  
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('uid', user.id)
      .single();
    
    if (error) {
      profileError = error;
    } else {
      userProfileTest = data;
    }
  } catch (err) {
    profileError = err as Error;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-6">Database Diagnostic</h1>
      
      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-2">User Authentication</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role || 'Not set'}</p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-2">Database Connection Test</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {dbConnectionTest || 'Failed'}</p>
            {dbError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {dbError.message}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <strong>Code:</strong> {(dbError as { code?: string }).code || 'N/A'}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <strong>Details:</strong> {(dbError as { details?: string }).details || 'None'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-2">User Profile Test</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {userProfileTest ? 'Success' : 'Failed'}</p>
            {userProfileTest && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <pre className="text-sm text-green-800">
                  {JSON.stringify(userProfileTest, null, 2)}
                </pre>
              </div>
            )}
            {profileError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {profileError.message}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <strong>Code:</strong> {(profileError as { code?: string }).code || 'N/A'}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  <strong>Details:</strong> {(profileError as { details?: string }).details || 'None'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-2">Possible Solutions</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Check if the &apos;user&apos; table exists in your Supabase database</li>
            <li>Verify that Row Level Security (RLS) is configured properly</li>
            <li>Ensure the user has proper permissions to access their own data</li>
            <li>Check if the table name is correct (might be &apos;users&apos; instead of &apos;user&apos;)</li>
            <li>Verify that the user profile was created when they signed up</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
