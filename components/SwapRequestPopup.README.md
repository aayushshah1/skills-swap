# SwapRequestPopup Component

A reusable, independent React component for creating skill swap requests in the Skills Swap Platform.

## Features

- ✅ **Independent Component**: Works without any external dependencies beyond basic UI components
- ✅ **Auto-fills User Data**: Automatically fetches current user information
- ✅ **Skills Dropdown**: Dynamically loads skills from database (with fallback)
- ✅ **Form Validation**: Validates inputs and prevents duplicate skill selection
- ✅ **Error Handling**: Comprehensive error handling with user feedback
- ✅ **Loading States**: Shows loading indicators during API calls
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **TypeScript Support**: Fully typed for type safety

## Installation

Simply copy the `SwapRequestPopup.tsx` file to your `components` directory. No additional setup required!

## Usage

```typescript
import { useState } from 'react';
import SwapRequestPopup from '@/components/SwapRequestPopup';

function YourComponent() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsPopupOpen(true)}>
        Request Skill Swap
      </button>

      <SwapRequestPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        targetUserId="user-uuid-here"
        targetUserName="John Doe" // Optional
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Controls popup visibility |
| `onClose` | `() => void` | ✅ | Callback when popup closes |
| `targetUserId` | `string` | ✅ | UUID of user to send request to |
| `targetUserName` | `string` | ❌ | Display name (optional) |

## Database Requirements

The component expects these database tables:

### 1. `swap_requests` table
```sql
CREATE TABLE swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    requested_user_id UUID NOT NULL,
    skill_offered TEXT NOT NULL,
    skill_wanted TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `skills` table (optional)
```sql
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Note**: If the `skills` table doesn't exist, the component will use fallback skills automatically.

## Fallback Skills

When the skills table is not available, the component uses these default skills:

- **Design**: Photoshop, Photography
- **Business**: Excel, Marketing  
- **Music**: Guitar
- **Technology**: Coding
- **Content**: Writing
- **Lifestyle**: Cooking

## Integration Examples

### Example 1: Profile Page
```typescript
import { useState } from 'react';
import SwapRequestPopup from '@/components/SwapRequestPopup';

export default function ProfilePage({ profile }) {
  const [showRequestPopup, setShowRequestPopup] = useState(false);

  return (
    <div className="profile-page">
      <h1>{profile.name}</h1>
      <p>Skills: {profile.skills.join(', ')}</p>
      
      <button onClick={() => setShowRequestPopup(true)}>
        Request Skill Swap
      </button>

      <SwapRequestPopup
        isOpen={showRequestPopup}
        onClose={() => setShowRequestPopup(false)}
        targetUserId={profile.id}
        targetUserName={profile.name}
      />
    </div>
  );
}
```

### Example 2: Profile Cards List
```typescript
import { useState } from 'react';
import SwapRequestPopup from '@/components/SwapRequestPopup';

export default function ProfilesList({ profiles }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="profiles-grid">
      {profiles.map(profile => (
        <div key={profile.id} className="profile-card">
          <h3>{profile.name}</h3>
          <p>{profile.location}</p>
          <button 
            onClick={() => setSelectedUser(profile)}
            className="request-button"
          >
            Send Request
          </button>
        </div>
      ))}

      {selectedUser && (
        <SwapRequestPopup
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          targetUserId={selectedUser.id}
          targetUserName={selectedUser.name}
        />
      )}
    </div>
  );
}
```

### Example 3: Search Results
```typescript
import { useState } from 'react';
import SwapRequestPopup from '@/components/SwapRequestPopup';

export default function SearchResults({ results }) {
  const [requestPopup, setRequestPopup] = useState({ open: false, user: null });

  const openRequestPopup = (user) => {
    setRequestPopup({ open: true, user });
  };

  const closeRequestPopup = () => {
    setRequestPopup({ open: false, user: null });
  };

  return (
    <div>
      {results.map(user => (
        <div key={user.id} className="search-result">
          <span>{user.name}</span>
          <button onClick={() => openRequestPopup(user)}>
            Request
          </button>
        </div>
      ))}

      <SwapRequestPopup
        isOpen={requestPopup.open}
        onClose={closeRequestPopup}
        targetUserId={requestPopup.user?.id || ''}
        targetUserName={requestPopup.user?.name}
      />
    </div>
  );
}
```

## Customization

### Styling
The component uses Tailwind CSS classes. You can customize the styling by modifying the className props or creating a custom theme.

### Skills Categories
To modify the fallback skills, edit the `setSkills` call in the `fetchSkills` function:

```typescript
setSkills([
  { id: 1, name: 'Your Custom Skill', category: 'Your Category' },
  // Add more skills...
]);
```

### Success/Error Handling
Replace the `alert()` call with your preferred notification system:

```typescript
// Replace this line:
alert('Swap request sent successfully!');

// With your toast notification:
toast.success('Swap request sent successfully!');
```

## Authentication

The component automatically handles authentication by:
1. Fetching the current user when opened
2. Showing appropriate error messages if not authenticated
3. Preventing form submission without authentication

## Error Handling

The component handles various error scenarios:
- User not authenticated
- Network errors
- Database errors
- Validation errors
- Missing required fields

## Browser Support

Works in all modern browsers that support:
- ES6+ features
- React 18+
- Next.js 13+

## Dependencies

### Required UI Components:
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/label`

### Required Icons:
- `lucide-react` (X, Send icons)

### Required Utilities:
- `@/utils/supabase/client` (Supabase client)

## Troubleshooting

### Common Issues:

1. **"Skills not loading"**
   - Check if `skills` table exists in your database
   - Component will use fallback skills if table doesn't exist

2. **"User not authenticated"**
   - Ensure user is logged in before opening popup
   - Check Supabase auth configuration

3. **"Request not sending"**
   - Verify `swap_requests` table exists
   - Check database permissions and RLS policies

4. **"TypeScript errors"**
   - Ensure all required UI components are installed
   - Check import paths match your project structure

## Migration from Main Branch

This component is designed to work independently. To use it in the main branch:

1. Copy `SwapRequestPopup.tsx` to your components directory
2. Ensure required UI components are available
3. Update import paths if necessary
4. No other changes required!

## Future Enhancements

Potential improvements for future versions:
- Rich text editor for description
- File attachments
- Real-time notifications
- Draft saving
- Request templates
- Bulk requests

---

**Ready to use! 🚀**
