/**
 * Core type definitions for Imakwa
 */

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  reputation_score: number;
  badge_level: 'new_citizen' | 'active_contributor' | 'community_leader';
  questions_count: number;
  answers_count: number;
  followers_count: number;
  following_count: number;
  total_upvotes_received: number;
  is_verified_expert: boolean;
}

export interface UserRelation {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Question types
export interface Question {
  id: string;
  user_id: string;
  title: string;
  description: string;
  topic_ids: string[];
  created_at: string;
  updated_at: string;
  view_count: number;
  answers_count: number;
  followers_count: number;
  is_solved: boolean;
}

export interface QuestionWithUser extends Question {
  user: UserProfile;
}

// Topic types
export interface Topic {
  id: string;
  name: string;
  description: string;
  category: 'State' | 'Issue';
  followers: number;
  created_at: string;
}

// Answer types
export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  vote_count: number;
  helpful_count: number;
  comments_count: number;
  is_pinned: boolean;
}

export interface AnswerWithUser extends Answer {
  user: UserProfile;
  comments: AnswerComment[];
  user_vote?: 'upvote' | 'downvote' | null;
}

export interface AnswerVote {
  id: string;
  answer_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

// Answer Comment types
export interface AnswerComment {
  id: string;
  answer_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AnswerCommentWithUser extends AnswerComment {
  user: UserProfile;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'new_answer' | 'new_comment' | 'new_follower' | 'new_question' | 'upvote' | 'trending';
  related_id: string;
  content: string;
  read_at?: string;
  created_at: string;
}

// Report/Moderation types
export interface Report {
  id: string;
  content_type: 'question' | 'answer' | 'comment' | 'user';
  content_id: string;
  report_reason: 'offensive' | 'harassment' | 'misinformation' | 'spam' | 'irrelevant' | 'other';
  description?: string;
  reported_by: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  created_at: string;
}

export interface ModerationLog {
  id: string;
  action: 'content_removed' | 'user_warned' | 'user_suspended' | 'content_restored';
  content_type: string;
  content_id: string;
  performed_by: string;
  reason: string;
  created_at: string;
}

// Bookmark types
export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  level: 'new_citizen' | 'active_contributor' | 'community_leader' | 'verified_expert';
  min_reputation: number;
  icon: string;
  description: string;
}

// Analytics types
export interface QuestionAnalytics {
  question_id: string;
  view_count: number;
  answer_count: number;
  engagement_rate: number;
  trending_score: number;
  last_updated: string;
}

export interface UserAnalytics {
  user_id: string;
  questions_asked: number;
  answers_given: number;
  total_upvotes: number;
  reputation_score: number;
  engagement_rate: number;
}

// Search types
export interface SearchResult {
  type: 'question' | 'answer' | 'user' | 'topic';
  id: string;
  title?: string;
  content?: string;
  user?: UserProfile;
  relevance_score: number;
}

// Form types
export interface CreateAnswerInput {
  question_id: string;
  content: string;
}

export interface CreateCommentInput {
  answer_id: string;
  content: string;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
}

export interface ReportInput {
  content_type: 'question' | 'answer' | 'comment' | 'user';
  content_id: string;
  report_reason: string;
  description?: string;
}
