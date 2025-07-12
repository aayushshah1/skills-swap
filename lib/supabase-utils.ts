// Utility functions for Supabase backend integration
import { createClient } from '@/utils/supabase/client';
import type {
  UserProfile,
  PublicUserProfile,
  SwapRequest,
  SwapRequestWithUsers,
  Skill,
  CreateProfileForm,
  UpdateProfileForm,
  CreateSwapRequestForm,
  SearchFilters,
  SupabaseResponse,
  PaginatedResponse,
  SwapStatus,
  UserSkillsAggregate,
  UserSkillMatch
} from '@/types/supabase';

const supabase = createClient();

// ==================== AUTH UTILITIES ====================

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// ==================== PROFILE UTILITIES ====================

export const createUserProfile = async (profileData: CreateProfileForm): Promise<SupabaseResponse<UserProfile>> => {
  try {
    const { user } = await getCurrentUser();
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
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getUserProfile = async (userId?: string): Promise<SupabaseResponse<UserProfile>> => {
  try {
    const targetUserId = userId || (await getCurrentUser()).user?.id;
    if (!targetUserId) throw new Error('User ID required');

    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', targetUserId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateUserProfile = async (updates: UpdateProfileForm): Promise<SupabaseResponse<UserProfile>> => {
  try {
    const { user } = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// ==================== BROWSE PROFILES ====================

export const getBrowseProfiles = async (
  page: number = 0,
  limit: number = 10
): Promise<SupabaseResponse<PaginatedResponse<PublicUserProfile>>> => {
  try {
    const { data, error, count } = await supabase
      .from('public_user_profiles')
      .select('*', { count: 'exact' })
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: {
        data: data || [],
        count: count || 0,
        page,
        limit,
        hasMore: (count || 0) > (page + 1) * limit
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const searchProfiles = async (filters: SearchFilters): Promise<SupabaseResponse<PublicUserProfile[]>> => {
  try {
    let query = supabase
      .from('public_user_profiles')
      .select('*');

    // Search by skill
    if (filters.skill) {
      query = query.or(`skills_offered.cs.{${filters.skill}},skills_wanted.cs.{${filters.skill}}`);
    }

    // Filter by location
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    // Filter by availability
    if (filters.availability && filters.availability.length > 0) {
      query = query.overlaps('availability', filters.availability);
    }

    // Pagination
    const page = filters.page || 0;
    const limit = filters.limit || 10;
    query = query.range(page * limit, (page + 1) * limit - 1);

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// ==================== SWAP REQUEST UTILITIES ====================

export const createSwapRequest = async (requestData: CreateSwapRequestForm): Promise<SupabaseResponse<SwapRequest>> => {
  try {
    const { user } = await getCurrentUser();
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
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getUserSwapRequests = async (userId?: string): Promise<SupabaseResponse<SwapRequestWithUsers[]>> => {
  try {
    const targetUserId = userId || (await getCurrentUser()).user?.id;
    if (!targetUserId) throw new Error('User ID required');

    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        requester:user!swap_requests_requester_id_fkey(id, name, photo_url),
        requested_user:user!swap_requests_requested_user_id_fkey(id, name, photo_url)
      `)
      .or(`requester_id.eq.${targetUserId},requested_user_id.eq.${targetUserId}`)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateSwapRequestStatus = async (
  requestId: string,
  newStatus: SwapStatus
): Promise<SupabaseResponse<boolean>> => {
  try {
    const { user } = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('update_swap_request_status', {
      request_id: requestId,
      new_status: newStatus,
      user_id: user.id
    });

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// ==================== SKILLS UTILITIES ====================

export const getAllSkills = async (): Promise<SupabaseResponse<Skill[]>> => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getUserSkills = async (userId?: string): Promise<SupabaseResponse<UserSkillsAggregate>> => {
  try {
    const targetUserId = userId || (await getCurrentUser()).user?.id;
    if (!targetUserId) throw new Error('User ID required');

    const { data, error } = await supabase.rpc('get_user_skills', {
      user_uuid: targetUserId
    });

    return { data: data?.[0] || null, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getUserSkillMatches = async (userId?: string): Promise<SupabaseResponse<UserSkillMatch[]>> => {
  try {
    const targetUserId = userId || (await getCurrentUser()).user?.id;
    if (!targetUserId) throw new Error('User ID required');

    const { data, error } = await supabase
      .from('user_skill_matches')
      .select('*')
      .eq('user1_id', targetUserId);

    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// ==================== STORAGE UTILITIES ====================

export const uploadProfilePhoto = async (file: File, userId: string): Promise<SupabaseResponse<string>> => {
  try {
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

    if (updateError) throw updateError;

    return { data: publicUrl, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const deleteProfilePhoto = async (userId: string): Promise<SupabaseResponse<boolean>> => {
  try {
    // Get current photo URL to extract filename
    const { data: user } = await getUserProfile(userId);
    if (!user?.photo_url) return { data: true, error: null };

    const fileName = user.photo_url.split('/').pop();
    if (!fileName) return { data: true, error: null };

    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([fileName]);

    if (deleteError) throw deleteError;

    // Remove photo URL from user profile
    const { error: updateError } = await supabase
      .from('user')
      .update({ photo_url: null })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// ==================== REAL-TIME UTILITIES ====================
// Note: Real-time subscriptions can be added later
// For now, use polling or manual refresh patterns

export const subscribeToSwapRequests = (
  userId: string,
  onUpdate: (payload: { new: SwapRequest; old: SwapRequest | null; eventType: string }) => void
) => {
  // TODO: Implement real-time subscription
  // For now, return a dummy unsubscribe function
  console.log(`TODO: Subscribe to swap requests for user ${userId}`, onUpdate);
  return {
    unsubscribe: () => console.log('Unsubscribed from swap requests')
  };
};

export const subscribeToProfileUpdates = (
  userId: string,
  onUpdate: (payload: { new: UserProfile; old: UserProfile | null; eventType: string }) => void
) => {
  // TODO: Implement real-time subscription
  // For now, return a dummy unsubscribe function
  console.log(`TODO: Subscribe to profile updates for user ${userId}`, onUpdate);
  return {
    unsubscribe: () => console.log('Unsubscribed from profile updates')
  };
};

// ==================== UTILITY FUNCTIONS ====================

export const formatSkillsArray = (skillsString: string): string[] => {
  return skillsString
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
};

export const formatSkillsString = (skillsArray: string[]): string => {
  return skillsArray.join(', ');
};

export const getSwapRequestStatus = (request: SwapRequest, currentUserId: string) => {
  const isRequester = request.requester_id === currentUserId;
  
  switch (request.status) {
    case 'pending':
      return isRequester ? 'Waiting for response' : 'Needs your response';
    case 'accepted':
      return 'Accepted - Ready to swap!';
    case 'rejected':
      return 'Declined';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return 'Unknown status';
  }
};

export const canUpdateSwapStatus = (request: SwapRequest, currentUserId: string): boolean => {
  return request.status === 'pending' && 
         (request.requester_id === currentUserId || request.requested_user_id === currentUserId);
};
