// TypeScript interfaces for Supabase backend integration

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type SwapStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserProfile {
  id: string;
  name: string | null;
  location: string | null;
  skills_offered: string[] | null;
  skills_wanted: string[] | null;
  availability: WeekDay[] | null;
  is_public: boolean;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUserProfile {
  id: string;
  name: string | null;
  location: string | null;
  skills_offered: string[] | null;
  skills_wanted: string[] | null;
  availability: WeekDay[] | null;
  photo_url: string | null;
  created_at: string;
  completed_swaps: number;
}

export interface Skill {
  id: number;
  name: string;
  category: string | null;
  created_at: string;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  requested_user_id: string;
  skill_offered: string;
  skill_wanted: string;
  description: string | null;
  status: SwapStatus;
  created_at: string;
  updated_at: string;
}

export interface SwapRequestWithUsers extends SwapRequest {
  requester: Pick<UserProfile, 'id' | 'name' | 'photo_url'>;
  requested_user: Pick<UserProfile, 'id' | 'name' | 'photo_url'>;
}

export interface RolePermission {
  id: string;
  user_id: string;
  role: UserRole;
  permissions: string[];
  created_at: string;
}

export interface UserSkillMatch {
  user1_id: string;
  user1_name: string;
  user2_id: string;
  user2_name: string;
  matching_skill: string;
  match_type: string;
}

export interface UserSkillsAggregate {
  offered_skills: string[];
  wanted_skills: string[];
  total_swaps_completed: number;
}

// Form interfaces for frontend components
export interface CreateProfileForm {
  name: string;
  location: string;
  skills_offered: string[];
  skills_wanted: string[];
  availability: WeekDay[];
  is_public: boolean;
}

export interface UpdateProfileForm extends Partial<CreateProfileForm> {
  photo_url?: string;
}

export interface CreateSwapRequestForm {
  requested_user_id: string;
  skill_offered: string;
  skill_wanted: string;
  description?: string;
}

export interface SearchFilters {
  skill?: string;
  location?: string;
  availability?: WeekDay[];
  page?: number;
  limit?: number;
}

// API Response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Database function parameters
export interface UpdateSwapStatusParams {
  request_id: string;
  new_status: SwapStatus;
  user_id: string;
}

export interface GetUserSkillsParams {
  user_uuid: string;
}
