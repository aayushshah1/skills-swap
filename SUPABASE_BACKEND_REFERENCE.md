# Supabase Backend Reference - Skill Swap Platform

## Overview
This document provides a complete reference for all Supabase backend components implemented for the Skill Swap Platform. Use this as a guide for frontend integration.

---

## 🗄️ Database Tables

### 1. `user` Table
**Primary table for user profiles and authentication**

```sql
CREATE TABLE user (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    location TEXT,
    skills_offered TEXT[],
    skills_wanted TEXT[],
    availability weekday[],
    is_public BOOLEAN DEFAULT true,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: UUID (linked to Supabase Auth user)
- `name`: User's display name
- `location`: User's location (city, country)
- `skills_offered`: Array of skills user can teach
- `skills_wanted`: Array of skills user wants to learn
- `availability`: Array of weekdays when user is available
- `is_public`: Whether profile is public (true) or private (false)
- `photo_url`: URL to profile photo in Supabase Storage
- `created_at`: Profile creation timestamp
- `updated_at`: Last profile update timestamp

**Indexes:**
- `idx_user_public` on `is_public` for faster public profile queries
- `idx_user_skills_offered` on `skills_offered` using GIN for array searches
- `idx_user_skills_wanted` on `skills_wanted` using GIN for array searches

### 2. `skills` Table
**Predefined skill categories for consistency**

```sql
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Auto-incrementing skill ID
- `name`: Skill name (e.g., "Photoshop", "Excel", "Guitar")
- `category`: Skill category (e.g., "Design", "Business", "Music")
- `created_at`: Skill creation timestamp

### 3. `swap_requests` Table
**Skill swap requests between users**

```sql
CREATE TABLE swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    requested_user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    skill_offered TEXT NOT NULL,
    skill_wanted TEXT NOT NULL,
    description TEXT,
    status swap_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique swap request ID
- `requester_id`: ID of user making the request
- `requested_user_id`: ID of user receiving the request
- `skill_offered`: Skill the requester offers
- `skill_wanted`: Skill the requester wants
- `description`: Optional message/description
- `status`: Current status (pending, accepted, rejected, cancelled, completed)
- `created_at`: Request creation timestamp
- `updated_at`: Last status update timestamp

**Indexes:**
- `idx_swap_requests_requester` on `requester_id`
- `idx_swap_requests_requested_user` on `requested_user_id`
- `idx_swap_requests_status` on `status`

### 4. `role_permissions` Table
**Admin roles and permissions**

```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
    permissions TEXT[] DEFAULT ARRAY['read'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Permission record ID
- `user_id`: User ID
- `role`: User role (admin, moderator, user)
- `permissions`: Array of permissions (read, write, delete, moderate)
- `created_at`: Role assignment timestamp

---

## 🔧 Custom Types (Enums)

### 1. `weekday` Type
```sql
CREATE TYPE weekday AS ENUM (
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
);
```

### 2. `swap_status` Type
```sql
CREATE TYPE swap_status AS ENUM (
    'pending', 'accepted', 'rejected', 'cancelled', 'completed'
);
```

---

## 📦 Supabase Storage

### Profile Photos Bucket
**Bucket Name:** `profile-photos`

**Storage Policies:**
1. **Upload Policy**: Users can upload their own profile photos
2. **View Policy**: Anyone can view profile photos
3. **Update Policy**: Users can update their own profile photos
4. **Delete Policy**: Users can delete their own profile photos

**File Structure:**
```
profile-photos/
├── {user_id}.jpg
├── {user_id}.png
└── {user_id}.webp
```

---

## 🚀 Database Functions

### 1. `update_swap_request_status`
**Purpose:** Update swap request status with validation

```sql
CREATE OR REPLACE FUNCTION update_swap_request_status(
    request_id UUID,
    new_status swap_status,
    user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE swap_requests 
    SET status = new_status, updated_at = NOW()
    WHERE id = request_id 
    AND (requester_id = user_id OR requested_user_id = user_id);
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```javascript
const { data, error } = await supabase.rpc('update_swap_request_status', {
    request_id: 'uuid-here',
    new_status: 'accepted',
    user_id: 'user-uuid-here'
});
```

### 2. `get_user_skills`
**Purpose:** Get aggregated skills for a user

```sql
CREATE OR REPLACE FUNCTION get_user_skills(user_uuid UUID)
RETURNS TABLE(
    offered_skills TEXT[],
    wanted_skills TEXT[],
    total_swaps_completed INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.skills_offered,
        u.skills_wanted,
        (SELECT COUNT(*)::INTEGER FROM swap_requests 
         WHERE (requester_id = user_uuid OR requested_user_id = user_uuid) 
         AND status = 'completed') as total_swaps_completed
    FROM user u
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```javascript
const { data, error } = await supabase.rpc('get_user_skills', {
    user_uuid: 'user-uuid-here'
});
```

---

## 📊 Database Views

### 1. `public_user_profiles`
**Purpose:** Optimized view for browsing public profiles

```sql
CREATE VIEW public_user_profiles AS
SELECT 
    id,
    name,
    location,
    skills_offered,
    skills_wanted,
    availability,
    photo_url,
    created_at,
    (SELECT COUNT(*) FROM swap_requests 
     WHERE (requester_id = u.id OR requested_user_id = u.id) 
     AND status = 'completed') as completed_swaps
FROM user u
WHERE is_public = true;
```

**Usage:**
```javascript
const { data, error } = await supabase
    .from('public_user_profiles')
    .select('*')
    .range(0, 9); // Pagination
```

### 2. `user_skill_matches`
**Purpose:** Find potential skill matches between users

```sql
CREATE VIEW user_skill_matches AS
SELECT DISTINCT
    u1.id as user1_id,
    u1.name as user1_name,
    u2.id as user2_id,
    u2.name as user2_name,
    skill_match.skill as matching_skill,
    'offered_wanted' as match_type
FROM user u1
CROSS JOIN user u2
CROSS JOIN LATERAL (
    SELECT unnest(u1.skills_offered) as skill
    INTERSECT
    SELECT unnest(u2.skills_wanted)
) skill_match
WHERE u1.id != u2.id
AND u1.is_public = true
AND u2.is_public = true;
```

**Usage:**
```javascript
const { data, error } = await supabase
    .from('user_skill_matches')
    .select('*')
    .eq('user1_id', currentUserId);
```

---

## 🔒 Row Level Security (RLS) Policies

### User Table Policies
1. **Users can read their own profile**
2. **Users can update their own profile**
3. **Public profiles are readable by everyone**
4. **Users can insert their own profile**

### Swap Requests Policies
1. **Users can read swap requests they're involved in**
2. **Users can create swap requests**
3. **Users can update swap requests they're involved in**

### Skills Table Policies
1. **Everyone can read skills**
2. **Only admins can insert/update skills**

---

## 🎯 Frontend Integration Examples

### 1. Create User Profile
```typescript
const createProfile = async (profileData: {
    name: string;
    location: string;
    skills_offered: string[];
    skills_wanted: string[];
    availability: string[];
    is_public: boolean;
}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('user')
        .insert({
            id: user.id,
            ...profileData
        })
        .select()
        .single();

    return { data, error };
};
```

### 2. Browse Public Profiles
```typescript
const getBrowseProfiles = async (page: number = 0, limit: number = 10) => {
    const { data, error } = await supabase
        .from('public_user_profiles')
        .select('*')
        .range(page * limit, (page + 1) * limit - 1)
        .order('created_at', { ascending: false });

    return { data, error };
};
```

### 3. Create Swap Request
```typescript
const createSwapRequest = async (requestData: {
    requested_user_id: string;
    skill_offered: string;
    skill_wanted: string;
    description?: string;
}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('swap_requests')
        .insert({
            requester_id: user.id,
            ...requestData
        })
        .select()
        .single();

    return { data, error };
};
```

### 4. Upload Profile Photo
```typescript
const uploadProfilePhoto = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

    // Update user profile with photo URL
    const { error: updateError } = await supabase
        .from('user')
        .update({ photo_url: publicUrl })
        .eq('id', userId);

    return { publicUrl, error: updateError };
};
```

### 5. Search Users by Skill
```typescript
const searchUsersBySkill = async (skill: string) => {
    const { data, error } = await supabase
        .from('public_user_profiles')
        .select('*')
        .or(`skills_offered.cs.{${skill}},skills_wanted.cs.{${skill}}`);

    return { data, error };
};
```

---

## 🚨 Important Notes for Frontend Development

### Authentication
- Always check `supabase.auth.getUser()` before database operations
- Use `supabase.auth.onAuthStateChange()` for auth state management
- Redirect to login if user is not authenticated

### Error Handling
```typescript
const handleSupabaseError = (error: any) => {
    if (error?.code === 'PGRST116') {
        return 'No data found';
    }
    if (error?.code === '23505') {
        return 'Duplicate entry';
    }
    return error?.message || 'An error occurred';
};
```

### Real-time Subscriptions
```typescript
// Listen for swap request updates
const subscription = supabase
    .channel('swap_requests')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'swap_requests' },
        (payload) => {
            console.log('Swap request changed:', payload);
        }
    )
    .subscribe();
```

### Data Validation
- Always validate data before sending to Supabase
- Use TypeScript interfaces for type safety
- Handle array operations carefully (skills_offered, skills_wanted, availability)

---

## 🔄 Next Steps for Frontend Integration

1. **Authentication Pages**: Implement login/signup using Supabase Auth
2. **Profile Management**: Use the profile functions and photo upload
3. **Browse Profiles**: Implement pagination using `public_user_profiles` view
4. **Swap Requests**: Create, view, and manage swap requests
5. **Search Functionality**: Implement skill-based search
6. **Real-time Updates**: Add subscriptions for swap request notifications

This backend is ready for frontend integration. All tables, functions, and policies are properly set up to support the full Skill Swap Platform functionality.
