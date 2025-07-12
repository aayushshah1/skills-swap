'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Send } from 'lucide-react';
import { toast } from 'sonner';

interface SwapRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserName?: string;
}

const DEFAULT_SKILLS = [
  'Photoshop', 'Excel', 'Guitar', 'Coding', 'Marketing', 'Writing', 
  'Photography', 'Cooking', 'Video Editing', 'Public Speaking', 
  'Data Analysis', 'Graphic Design', 'UI/UX Design', 'Spanish', 
  'French', 'Piano', 'Yoga', 'Accounting', 'Project Management'
];

export function SwapRequestPopup({
  isOpen,
  onClose,
  targetUserName
}: SwapRequestPopupProps) {
  const [skillOffered, setSkillOffered] = useState('');
  const [skillRequested, setSkillRequested] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const resetForm = () => {
    setSkillOffered('');
    setSkillRequested('');
    setDescription('');
    setError(null);
  };

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
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to create a swap request');
      }

      // Insert swap request
      const { error: insertError } = await supabase
        .from('swap_requests')
        .insert([
          {
            requester_uid: user.id,
            skill_offered: skillOffered,
            skill_requested: skillRequested,
            description: description.trim() || null,
            status: 'pending',
          },
        ]);

      if (insertError) throw insertError;

      // Success!
      toast.success('Swap request created successfully!');
      handleClose();
      
    } catch (err: unknown) {
      console.error('Error creating swap request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create swap request';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Create Swap Request</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {targetUserName && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              Creating request as: <span className="font-medium">{targetUserName}</span>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skillOffered">Skill You Offer</Label>
              <select
                id="skillOffered"
                value={skillOffered}
                onChange={(e) => setSkillOffered(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a skill you can teach</option>
                {DEFAULT_SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillRequested">Skill You Want</Label>
              <select
                id="skillRequested"
                value={skillRequested}
                onChange={(e) => setSkillRequested(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a skill you want to learn</option>
                {DEFAULT_SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Message (Optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a personal message to your request..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-right">
                {description.length}/500
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !skillOffered || !skillRequested}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Create Request
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SwapRequestPopup;
