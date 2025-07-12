import { createClient } from '@/utils/supabase/server';
import Header from '@/components/ui/header';
import { redirect } from 'next/navigation';

export default async function SwapRequestDiagnosticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: swap_requests, error } = await supabase
    .from('swap_requests')
    .select(`
      skill_offered,
      skill_requested,
      description,
      status,
      updated_at
    `);

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-6">Swap Requests</h1>

        <div className="rounded-lg border p-4 mb-6 space-y-4">
          {swap_requests && swap_requests.length > 0 ? (
            <div className="grid gap-4">
              {swap_requests.map((request, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded p-4">
                  <p className="text-sm text-green-800"><strong>Skill Offered:</strong> {request.skill_offered}</p>
                  <p className="text-sm text-green-800"><strong>Skill Requested:</strong> {request.skill_requested}</p>
                  <p className="text-sm text-green-800"><strong>Description:</strong> {request.description || 'N/A'}</p>
                  <p className="text-sm text-green-800"><strong>Status:</strong> {request.status}</p>
                  <p className="text-sm text-green-800"><strong>Updated At:</strong> {request.updated_at}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No requests found.</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error.message}
              </p>
              <p className="text-sm text-red-600 mt-1">
                <strong>Code:</strong> {(error as { code?: string }).code || 'N/A'}
              </p>
              <p className="text-sm text-red-600 mt-1">
                <strong>Details:</strong> {(error as { details?: string }).details || 'None'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
