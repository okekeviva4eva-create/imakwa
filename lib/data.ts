/**
 * Raw Supabase queries used by the Zustand data store and screens.
 * Keep field names aligned with the legacy store shapes (camelCase)
 * so screen code does not need to change.
 */
import { supabase } from '@/lib/supabase';

export type DbTopic = {
  id: string;
  name: string;
  description: string;
  state: string | null;
  category: 'State' | 'Issue';
  followers: number;
  question_count: number;
};

export type DbProfile = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  state: string;
  credentials: string | null;
};

export type DbQuestionView = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  views: number;
  created_at: string;
  followers: number;
  answer_count: number;
  author_handle: string;
  author_name: string;
  author_state: string;
  author_credentials: string | null;
};

export type DbAnswerView = {
  id: string;
  question_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author_handle: string;
  author_name: string;
  author_state: string;
  author_credentials: string | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
};

export type DbComment = {
  id: string;
  answer_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type DbNotification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'answer' | 'upvote' | 'follow' | 'mention' | 'comment';
  question_id: string | null;
  answer_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export async function fetchTopics(): Promise<DbTopic[]> {
  const { data, error } = await supabase
    .from('topics_view')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
    .returns<DbTopic[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfiles(): Promise<DbProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .returns<DbProfile[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchQuestions(): Promise<DbQuestionView[]> {
  const { data, error } = await supabase
    .from('questions_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
    .returns<DbQuestionView[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchAnswers(): Promise<DbAnswerView[]> {
  const { data, error } = await supabase
    .from('answers_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
    .returns<DbAnswerView[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchQuestionTopicLinks(): Promise<{ question_id: string; topic_id: string }[]> {
  const { data, error } = await supabase.from('question_topics').select('question_id, topic_id');
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyVotes(userId: string) {
  const { data, error } = await supabase
    .from('answer_votes')
    .select('answer_id, vote')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as { answer_id: string; vote: 1 | -1 }[];
}

export async function fetchMyFollows(userId: string) {
  const [topics, questions, users] = await Promise.all([
    supabase.from('topic_follows').select('topic_id').eq('user_id', userId).returns<{ topic_id: string }[]>(),
    supabase.from('question_follows').select('question_id').eq('user_id', userId).returns<{ question_id: string }[]>(),
    supabase.from('user_follows').select('followed_id').eq('follower_id', userId).returns<{ followed_id: string }[]>(),
  ]);
  if (topics.error) throw topics.error;
  if (questions.error) throw questions.error;
  if (users.error) throw users.error;
  return {
    topicIds: (topics.data ?? []).map((r) => r.topic_id),
    questionIds: (questions.data ?? []).map((r) => r.question_id),
    userIds: (users.data ?? []).map((r) => r.followed_id),
  };
}

export async function fetchMyNotifications(userId: string): Promise<DbNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<DbNotification[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchCommentsForAnswers(answerIds: string[]): Promise<DbComment[]> {
  if (answerIds.length === 0) return [];
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .in('answer_id', answerIds)
    .order('created_at', { ascending: true })
    .returns<DbComment[]>();
  if (error) throw error;
  return data ?? [];
}

// ----- Mutations -----

export async function ensureMyProfile(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = authUser.user_metadata ?? {};
  const handle =
    (typeof meta.handle === 'string' ? meta.handle : undefined) ||
    (authUser.email ? authUser.email.split('@')[0]?.replace(/[^a-z0-9_]/gi, '_').slice(0, 20) : null) ||
    `user_${authUser.id.slice(0, 6)}`;
  const name = (typeof meta.name === 'string' ? meta.name : undefined) || handle;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: authUser.id, handle, name }, { onConflict: 'id', ignoreDuplicates: true });
  if (error && !error.message.includes('duplicate')) {
    // ignore — trigger usually creates the profile
  }
}

export async function insertQuestion(input: {
  authorId: string;
  title: string;
  body: string;
  topicIds: string[];
}): Promise<string> {
  const { data, error } = await supabase
    .from('questions')
    .insert({ author_id: input.authorId, title: input.title, body: input.body })
    .select('id')
    .single()
    .returns<{ id: string }>();
  if (error) throw error;
  const questionId = data.id;
  if (input.topicIds.length > 0) {
    const rows = input.topicIds.map((topic_id) => ({ question_id: questionId, topic_id }));
    const { error: linkErr } = await supabase.from('question_topics').insert(rows);
    if (linkErr) throw linkErr;
  }
  // Auto-follow your own question
  await supabase.from('question_follows').insert({ user_id: input.authorId, question_id: questionId });
  return questionId;
}

export async function insertAnswer(input: {
  authorId: string;
  questionId: string;
  body: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('answers')
    .insert({ author_id: input.authorId, question_id: input.questionId, body: input.body })
    .select('id')
    .single()
    .returns<{ id: string }>();
  if (error) throw error;
  return data.id;
}

export async function insertComment(input: {
  authorId: string;
  answerId: string;
  body: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ author_id: input.authorId, answer_id: input.answerId, body: input.body })
    .select('id')
    .single()
    .returns<{ id: string }>();
  if (error) throw error;
  return data.id;
}

export async function castVoteRpc(answerId: string, vote: 1 | -1 | 0) {
  const { error } = await supabase.rpc('cast_vote', { p_answer_id: answerId, p_vote: vote });
  if (error) throw error;
}

export async function bumpQuestionViews(questionId: string) {
  await supabase.rpc('bump_question_views', { p_question_id: questionId });
}

export async function toggleTopicFollowDb(userId: string, topicId: string, follow: boolean) {
  if (follow) {
    const { error } = await supabase
      .from('topic_follows')
      .insert({ user_id: userId, topic_id: topicId });
    if (error && !error.message.includes('duplicate')) throw error;
  } else {
    const { error } = await supabase
      .from('topic_follows')
      .delete()
      .eq('user_id', userId)
      .eq('topic_id', topicId);
    if (error) throw error;
  }
}

export async function toggleQuestionFollowDb(userId: string, questionId: string, follow: boolean) {
  if (follow) {
    const { error } = await supabase
      .from('question_follows')
      .insert({ user_id: userId, question_id: questionId });
    if (error && !error.message.includes('duplicate')) throw error;
  } else {
    const { error } = await supabase
      .from('question_follows')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId);
    if (error) throw error;
  }
}

export async function toggleUserFollowDb(followerId: string, followedId: string, follow: boolean) {
  if (follow) {
    const { error } = await supabase
      .from('user_follows')
      .insert({ follower_id: followerId, followed_id: followedId });
    if (error && !error.message.includes('duplicate')) throw error;
  } else {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('followed_id', followedId);
    if (error) throw error;
  }
}

export async function searchQuestionsRpc(q: string): Promise<DbQuestionView[]> {
  if (!q.trim()) return [];
  const { data, error } = await supabase.rpc('search_questions', {
    p_query: q.trim(),
    p_limit: 30,
  });
  if (error) throw error;
  return (data ?? []) as unknown as DbQuestionView[];
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}

