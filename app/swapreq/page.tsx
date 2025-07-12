'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export default function SwapRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('swap_requests')
        .select(`*, user:requester_uid(display_name, photo_url, skills_offered, skills_wanted)`) 
        .eq('receiver_uid', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching swap requests:', error);
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const updateRequestStatus = async (id: number, status: string) => {
    await supabase.from('swap_requests').update({ status }).eq('id', id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

//   if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Incoming Swap Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">No incoming requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <img src={req.user?.photo_url || '/default-user.png'} alt="User" className="rounded-full w-12 h-12" />
                  </Avatar>
                  <div>
                    <p className="font-semibold">{req.user?.display_name}</p>
                    <p className="text-sm text-gray-500">Offered: {req.skill_offered}</p>
                    <p className="text-sm text-gray-500">Wants: {req.skill_requested}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  {req.status === 'pending' ? (
                    <>
                      <Button variant="outline" className="text-green-600 border-green-500 hover:bg-green-50" onClick={() => updateRequestStatus(req.id, 'accepted')}>Accept</Button>
                      <Button variant="outline" className="text-red-600 border-red-500 hover:bg-red-50" onClick={() => updateRequestStatus(req.id, 'rejected')}>Reject</Button>
                    </>
                  ) : (
                    <span className={`text-sm font-medium ${req.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>Status: {req.status}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
