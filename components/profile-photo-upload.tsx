'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
}

export function ProfilePhotoUpload({ userId, currentPhotoUrl, onPhotoUploaded }: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      onPhotoUploaded(publicUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {currentPhotoUrl && (
          <Image 
            src={currentPhotoUrl} 
            alt="Profile" 
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div>
          <Label htmlFor="photo-upload">Profile Photo</Label>
          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            disabled={uploading}
            className="mt-1"
          />
          {uploading && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
        </div>
      </div>
    </div>
  );
}
