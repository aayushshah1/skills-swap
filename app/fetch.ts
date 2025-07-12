import { createClient } from '@/utils/supabase/server';

export interface UserProfile {
  uid: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  public: boolean | null;
  roles: string | null;
  location: string | null;
  availability: string[] | null;
  photo_url: string | null;
  created_at: string;
}

export interface SwapRequest {
  id: number;
  requester_uid: string;
  skill_offered: string;
  skill_requested: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  created_at: string;
}

/**
 * Create a new user profile
 */
export async function createUserProfile(uid: string, email: string | undefined): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    
    const newProfile = {
      uid,
      first_name: null,
      last_name: null,
      display_name: email?.split('@')[0] || null,
      public: true,
      roles: 'user',
      location: null,
      availability: [],
      photo_url: null,
    };

    const { data, error } = await supabase
      .from('user')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error creating user profile:', err);
    return null;
  }
}

/**
 * Fetch user profile from the database (Admin only)
 * Only admins can access any user's profile
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    
    // Get the current user and their session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (userError || !user || sessionError || !session) {
      console.error('Error getting current user or session:', userError || sessionError);
      return null;
    }

    // Decode JWT to extract role
    const token = session.access_token;
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const role = payload.user_role || "user";

    // Check if user has admin role
    if (role !== "admin") {
      console.error('Permission denied: fetchUserProfile requires admin role');
      return null;
    }

    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching user profile:', err);
    return null;
  }
}

/**
 * Fetch the current user's own profile from the database
 * Users can only access their own profile regardless of role
 */
export async function fetchOwnUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('uid', user.id)
      .single();

    if (error) {
      console.error('Error fetching own user profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching own user profile:', err);
    return null;
  }
}

/**
 * Fetch user's own swap requests
 * Users can only access their own swap requests
 */
export async function fetchUserSwapRequests(): Promise<SwapRequest[]> {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error getting current user for swap requests:', userError);
    return [];
  }
  
  const { data, error } = await supabase
    .from('swap_requests')
    .select('*')
    .eq('requester_uid', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching swap requests:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all pending swap requests for the current user (requests they can potentially respond to)
 * Users can only see pending requests from other users
 */
export async function fetchPendingSwapRequestsForUser(): Promise<SwapRequest[]> {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error getting current user for pending requests:', userError);
    return [];
  }
  
  // Get swap requests where the user has the skill being requested
  // and exclude requests made by the user themselves
  const { data, error } = await supabase
    .from('swap_requests')
    .select('*')
    .neq('requester_uid', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending swap requests:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all available skills
 */
export async function fetchAllSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch skills by category
 */
export async function fetchSkillsByCategory(category: string): Promise<Skill[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching skills by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user')
    .upsert(profile, { onConflict: 'uid' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    return null;
  }

  return data;
}

/**
 * Create a new swap request
 */
export async function createSwapRequest(swapRequest: Omit<SwapRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SwapRequest | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('swap_requests')
    .insert(swapRequest)
    .select()
    .single();

  if (error) {
    console.error('Error creating swap request:', error);
    return null;
  }

  return data;
}

/**
 * Update swap request status
 */
export async function updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('swap_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating swap request status:', error);
    return null;
  }

  return data;
}

/**
 * Get user statistics (total requests, completed swaps, etc.)
 * Can only fetch stats for the current user
 */
export async function fetchUserStats(): Promise<{
  totalRequests: number;
  completedSwaps: number;
  pendingRequests: number;
  rating: number;
}> {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('Error getting current user for stats:', userError);
    return { totalRequests: 0, completedSwaps: 0, pendingRequests: 0, rating: 0 };
  }

  // Use the current user's ID, ignore the passed uid parameter for security
  const targetUid = user.id;
  
  // Get swap request counts
  const { data: requests, error: requestError } = await supabase
    .from('swap_requests')
    .select('status')
    .eq('requester_uid', targetUid);

  if (requestError) {
    console.error('Error fetching user stats:', requestError);
    return { totalRequests: 0, completedSwaps: 0, pendingRequests: 0, rating: 0 };
  }

  const totalRequests = requests?.length || 0;
  const completedSwaps = requests?.filter(r => r.status === 'completed').length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  
  // For now, rating is calculated based on completion rate
  // In the future, this could be replaced with actual user ratings
  const rating = totalRequests > 0 ? (completedSwaps / totalRequests) * 5 : 0;

  return {
    totalRequests,
    completedSwaps,
    pendingRequests,
    rating: Math.round(rating * 10) / 10 // Round to 1 decimal place
  };
}

/**
 * Get user statistics for any user (Admin only)
 * Only admins can fetch stats for other users
 */
export async function fetchUserStatsAdmin(uid: string): Promise<{
  totalRequests: number;
  completedSwaps: number;
  pendingRequests: number;
  rating: number;
}> {
  const supabase = await createClient();
  
  // Get the current user and their session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (userError || !user || sessionError || !session) {
    console.error('Error getting current user or session:', userError || sessionError);
    return { totalRequests: 0, completedSwaps: 0, pendingRequests: 0, rating: 0 };
  }

  // Decode JWT to extract role
  const token = session.access_token;
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );
  const role = payload.user_role || "user";

  // Check if user has admin role
  if (role !== "admin") {
    console.error('Permission denied: fetchUserStatsAdmin requires admin role');
    return { totalRequests: 0, completedSwaps: 0, pendingRequests: 0, rating: 0 };
  }
  
  // Get swap request counts for the specified user
  const { data: requests, error: requestError } = await supabase
    .from('swap_requests')
    .select('status')
    .eq('requester_uid', uid);

  if (requestError) {
    console.error('Error fetching user stats:', requestError);
    return { totalRequests: 0, completedSwaps: 0, pendingRequests: 0, rating: 0 };
  }

  const totalRequests = requests?.length || 0;
  const completedSwaps = requests?.filter(r => r.status === 'completed').length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  
  // For now, rating is calculated based on completion rate
  // In the future, this could be replaced with actual user ratings
  const rating = totalRequests > 0 ? (completedSwaps / totalRequests) * 5 : 0;

  return {
    totalRequests,
    completedSwaps,
    pendingRequests,
    rating: Math.round(rating * 10) / 10 // Round to 1 decimal place
  };
}

/**
 * Fetch all users (Admin only)
 * Only admins can access the list of all users
 */
export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const supabase = await createClient();
    
    // Get the current user and their session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (userError || !user || sessionError || !session) {
      console.error('Error getting current user or session:', userError || sessionError);
      return [];
    }

    // Decode JWT to extract role
    const token = session.access_token;
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const role = payload.user_role || "user";

    // Check if user has admin role
    if (role !== "admin") {
      console.error('Permission denied: fetchAllUsers requires admin role');
      return [];
    }

    const { data, error } = await supabase
      .from('user')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching all users:', err);
    return [];
  }
}
