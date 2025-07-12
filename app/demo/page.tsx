'use client';

import { useState } from 'react';
import SwapRequestPopup from '@/components/SwapRequestPopup';

export default function SwapRequestDemo() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Swap Request Popup Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Demo Profile Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                JD
              </div>
              <div>
                <h2 className="text-xl font-semibold">John Doe</h2>
                <p className="text-gray-600">San Francisco, CA</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Skills Offered:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Photoshop</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Guitar</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Coding</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Skills Wanted:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Excel</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Photography</span>
              </div>
            </div>

            <button
              onClick={() => setShowPopup(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Swap Request
            </button>
          </div>

          {/* Demo Profile Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                AS
              </div>
              <div>
                <h2 className="text-xl font-semibold">Alice Smith</h2>
                <p className="text-gray-600">New York, NY</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Skills Offered:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Marketing</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Writing</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Cooking</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Skills Wanted:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Video Editing</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Data Analysis</span>
              </div>
            </div>

            <button
              onClick={() => setShowPopup(true)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              Send Swap Request
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Component Usage</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">
              This is a demo of the SwapRequestPopup component. Click the buttons above to test the functionality.
            </p>
            <div>
              <h3 className="font-medium">Features:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Auto-fills current user data</li>
                <li>Skill dropdowns with validation</li>
                <li>Optional message field</li>
                <li>Complete error handling</li>
                <li>Responsive design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      <SwapRequestPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        targetUserId="demo-user-1"
        targetUserName="John Doe"
      />
    </div>
  );
}
