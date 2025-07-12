// HOW TO USE SwapRequestPopup Component
// Copy this code where you want to add the "Request" button

'use client';

import { useState } from 'react';
import SwapRequestPopup from './SwapRequestPopup';

export default function ProfilePage() {
  const [showSwapPopup, setShowSwapPopup] = useState(false);
  
  // Replace these with actual user data
  const targetUserId = 'user-123';
  const targetUserName = 'John Doe';

  return (
    <div className="p-6">
      {/* Your existing profile content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <p className="text-gray-600 mb-4">Skills: Photoshop, Marketing</p>
        
        {/* Add this button anywhere in your profile page */}
        <button
          onClick={() => setShowSwapPopup(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Request Skill Swap
        </button>
      </div>

      {/* Add this popup component */}
      <SwapRequestPopup
        isOpen={showSwapPopup}
        onClose={() => setShowSwapPopup(false)}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
      />
    </div>
  );
}
