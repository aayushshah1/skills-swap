'use client';

import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

interface SwapRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
}

const SKILLS = [
  'Photoshop', 'Excel', 'Guitar', 'Coding', 'Marketing', 'Writing', 
  'Photography', 'Cooking', 'Video Editing', 'Public Speaking', 
  'Data Analysis', 'Graphic Design', 'UI/UX Design', 'Spanish', 
  'French', 'Piano', 'Yoga', 'Accounting', 'Project Management'
];

export default function SwapRequestPopup({
  isOpen,
  onClose,
  targetUserId,
  targetUserName
}: SwapRequestPopupProps) {
  const [skillOffered, setSkillOffered] = useState('');
  const [skillRequested, setSkillRequested] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      setSkillOffered('');
      setSkillRequested('');
      setDescription('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!skillOffered || !skillRequested) {
      setError('Please select both skills offered and requested');
      return;
    }

    if (skillOffered === skillRequested) {
      setError('Skills offered and requested cannot be the same');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import Supabase client
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to create a swap request');
      }

      // Create swap request
      const { error: insertError } = await supabase
        .from('swap_requests')
        .insert({
          requester_id: user.id,
          requested_user_id: targetUserId,
          skill_offered: skillOffered,
          skill_wanted: skillRequested,
          description: description.trim() || null,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: unknown) {
      console.error('Error creating swap request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create swap request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSkillOffered('');
    setSkillRequested('');
    setDescription('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Send Swap Request</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {targetUserName && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              Sending request to: <span className="font-medium">{targetUserName}</span>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
              ✅ Swap request sent successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="skillOffered" className="block text-sm font-medium text-gray-700">
                Skill You Offer
              </label>
              <select
                id="skillOffered"
                value={skillOffered}
                onChange={(e) => setSkillOffered(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading || success}
              >
                <option value="">Select a skill you can teach</option>
                {SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="skillRequested" className="block text-sm font-medium text-gray-700">
                Skill You Want
              </label>
              <select
                id="skillRequested"
                value={skillRequested}
                onChange={(e) => setSkillRequested(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading || success}
              >
                <option value="">Select a skill you want to learn</option>
                {SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Message (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a personal message to your request..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
                disabled={loading || success}
              />
              <div className="text-xs text-gray-500 text-right">
                {description.length}/500
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || success}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </div>
                ) : success ? (
                  'Sent!'
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Request
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
