/**
 * Imakwa data store — Supabase-backed snapshot cache exposed as a Zustand store.
 * Screens read `topics`, `users`, `questions`, `answers`, `notifications`, `comments`,
 * etc. as in-memory arrays; this store keeps them in sync with the database.
 *
 * Why a snapshot cache instead of pure react-query?
 * Existing screens were authored against a Zustand mock store. Keeping the same
 * shape (arrays + camelCase fields) lets us swap mocks for live data with no
 * screen rewrite. Mutations are optimistic locally, then reconciled by refetch.
 */
import { create } from 'zustand';

import {
  bumpQuestionViews,
  castVoteRpc,
  ensureMyProfile,
  fetchAnswers,
  fetchCommentsForAnswers,
  fetchMyFollows,
  fetchMyNotifications,
  fetchMyVotes,
  fetchProfiles,
  fetchQuestionTopicLinks,
  fetchQuestions,
  fetchTopics,
  insertAnswer,
  insertComment,
  insertQuestion,
  markAllNotificationsRead,
  searchQuestionsRpc,
  toggleQuestionFollowDb,
  toggleTopicFollowDb,
  toggleUserFollowDb,
  type DbQuestionView,
} from '@/lib/data';
import { supabase } from '@/lib/supabase';

// ---------- Public types (stable shape used by screens) ----------

export type SEState = string;

export type Topic = {
  id: string;
  name: string;
  description: string;
  followers: number;
  state?: string;
  category: 'State' | 'Issue';
};

export type User = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  state: string;
  credentials?: string;
  followers: number;
  following: number;
  questionsAsked: number;
  answersGiven: number;
};

export type Answer = {
  id: string;
  questionId: string;
  authorId: string;
  body: string;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  comments: number;
};

export type Question = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  topicIds: string[];
  createdAt: number;
  views: number;
  followers: number;
  isFollowing?: boolean;
};

export type Comment = {
  id: string;
  answerId: string;
  authorId: string;
  body: string;
  createdAt: number;
};

export type Notification = {
  id: string;
  type: 'answer' | 'upvote' | 'follow' | 'mention' | 'comment';
  actorId: string;
  questionId?: string;
  message: string;
  createdAt: number;
  read: boolean;
};

type Store = {
  topics: Topic[];
  users: User[];
  questions: Question[];
  answers: Answer[];
  comments: Comment[];
  notifications: Notification[];
  followedTopicIds: string[];
  followedUserIds: string[];
  followedQuestionIds: string[];
  currentUserId: string;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: Question[];
  searchLoading: boolean;

  setCurrentUser: (userId: string | null) => void;
  loadAll: (userId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;

  addQuestion: (input: { title: string; body: string; topicIds: string[] }) => Promise<string>;
  addAnswer: (questionId: string, body: string) => Promise<void>;
  addComment: (answerId: string, body: string) => Promise<void>;
  loadCommentsFor: (answerId: string) => Promise<void>;
  voteAnswer: (answerId: string, vote: 'up' | 'down') => void;
  toggleFollowTopic: (topicId: string) => void;
  toggleFollowQuestion: (questionId: string) => void;
  toggleFollowUser: (userId: string) => void;
  markNotificationsRead: () => void;
  recordView: (questionId: string) => void;
  runSearch: (q: string) => Promise<void>;
  clearSearch: () => void;
};

// ---------- Mappers ----------

function questionViewToQuestion(v: DbQuestionView, topicIds: string[]): Question {
  return {
    id: v.id,
    authorId: v.author_id,
    title: v.title,
    body: v.body,
    topicIds,
    createdAt: new Date(v.created_at).getTime(),
    views: v.views,
    followers: v.followers,
  };
}

// ---------- Store ----------

const INITIAL: Pick<
  Store,
  | 'topics'
  | 'users'
  | 'questions'
  | 'answers'
  | 'comments'
  | 'notifications'
  | 'followedTopicIds'
  | 'followedUserIds'
  | 'followedQuestionIds'
  | 'currentUserId'
  | 'hydrated'
  | 'loading'
  | 'error'
  | 'searchQuery'
  | 'searchResults'
  | 'searchLoading'
> = {
  topics: [],
  users: [],
  questions: [],
  answers: [],
  comments: [],
  notifications: [],
  followedTopicIds: [],
  followedUserIds: [],
  followedQuestionIds: [],
  currentUserId: '',
  hydrated: false,
  loading: false,
  error: null,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
};

export const useStore = create<Store>()((set, get) => ({
  ...INITIAL,

  setCurrentUser: (userId) => set({ currentUserId: userId ?? '' }),

  reset: () => set({ ...INITIAL }),

  loadAll: async (userId) => {
    set({ loading: true, error: null });
    try {
      const [topics, profiles, questionViews, answerViews, links] = await Promise.all([
        fetchTopics(),
        fetchProfiles(),
        fetchQuestions(),
        fetchAnswers(),
        fetchQuestionTopicLinks(),
      ]);

      // user-scoped slices (only when logged in)
      const [votes, follows, notifications] = userId
        ? await Promise.all([
            fetchMyVotes(userId),
            fetchMyFollows(userId),
            fetchMyNotifications(userId),
          ])
        : [[], { topicIds: [], questionIds: [], userIds: [] }, []];

      // Build topic-id list per question
      const topicIdsByQuestion = new Map<string, string[]>();
      for (const link of links) {
        const arr = topicIdsByQuestion.get(link.question_id) ?? [];
        arr.push(link.topic_id);
        topicIdsByQuestion.set(link.question_id, arr);
      }

      const voteByAnswerId = new Map<string, 'up' | 'down'>();
      for (const v of votes) {
        voteByAnswerId.set(v.answer_id, v.vote === 1 ? 'up' : 'down');
      }

      // Aggregate per-author counts from existing data
      const askedByAuthor = new Map<string, number>();
      const answeredByAuthor = new Map<string, number>();
      for (const q of questionViews) {
        askedByAuthor.set(q.author_id, (askedByAuthor.get(q.author_id) ?? 0) + 1);
      }
      for (const a of answerViews) {
        answeredByAuthor.set(a.author_id, (answeredByAuthor.get(a.author_id) ?? 0) + 1);
      }

      const mappedTopics: Topic[] = topics.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        followers: t.followers,
        state: t.state ?? 'Regional',
        category: t.category,
      }));

      const mappedUsers: User[] = profiles.map((p) => ({
        id: p.id,
        name: p.name,
        handle: p.handle,
        bio: p.bio ?? '',
        state: p.state ?? 'Regional',
        credentials: p.credentials ?? undefined,
        followers: 0,
        following: 0,
        questionsAsked: askedByAuthor.get(p.id) ?? 0,
        answersGiven: answeredByAuthor.get(p.id) ?? 0,
      }));

      const mappedQuestions: Question[] = questionViews.map((q) =>
        questionViewToQuestion(q, topicIdsByQuestion.get(q.id) ?? []),
      );

      const mappedAnswers: Answer[] = answerViews.map((a) => ({
        id: a.id,
        questionId: a.question_id,
        authorId: a.author_id,
        body: a.body,
        createdAt: new Date(a.created_at).getTime(),
        upvotes: a.upvotes,
        downvotes: a.downvotes,
        comments: a.comment_count,
        userVote: voteByAnswerId.get(a.id) ?? null,
      }));

      const mappedNotifications: Notification[] = notifications.map((n) => ({
        id: n.id,
        type: n.type,
        actorId: n.actor_id ?? '',
        questionId: n.question_id ?? undefined,
        message: n.message,
        createdAt: new Date(n.created_at).getTime(),
        read: n.read,
      }));

      set({
        topics: mappedTopics,
        users: mappedUsers,
        questions: mappedQuestions,
        answers: mappedAnswers,
        notifications: mappedNotifications,
        followedTopicIds: follows.topicIds,
        followedQuestionIds: follows.questionIds,
        followedUserIds: follows.userIds,
        currentUserId: userId ?? '',
        hydrated: true,
        loading: false,
        error: null,
      });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load data',
        hydrated: true,
      });
    }
  },

  refresh: async () => {
    const userId = get().currentUserId || null;
    await get().loadAll(userId);
  },

  addQuestion: async ({ title, body, topicIds }) => {
    const me = get().currentUserId;
    if (!me) throw new Error('You must be signed in to ask a question.');
    const id = await insertQuestion({ authorId: me, title, body, topicIds });

    // Optimistic insert at the top of the feed; refetch will reconcile
    const me_user = get().users.find((u) => u.id === me);
    const optimistic: Question = {
      id,
      authorId: me,
      title,
      body,
      topicIds,
      createdAt: Date.now(),
      views: 1,
      followers: 1,
    };
    set((s) => ({
      questions: [optimistic, ...s.questions],
      followedQuestionIds: [id, ...s.followedQuestionIds.filter((q) => q !== id)],
      users: me_user
        ? s.users.map((u) =>
            u.id === me ? { ...u, questionsAsked: u.questionsAsked + 1 } : u,
          )
        : s.users,
    }));
    // Background reconcile (don't await — UI is already showing the question)
    void get().refresh();
    return id;
  },

  addAnswer: async (questionId, body) => {
    const me = get().currentUserId;
    if (!me) throw new Error('You must be signed in to answer.');
    const id = await insertAnswer({ authorId: me, questionId, body });
    const optimistic: Answer = {
      id,
      questionId,
      authorId: me,
      body,
      createdAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      userVote: null,
    };
    set((s) => ({
      answers: [optimistic, ...s.answers],
      users: s.users.map((u) =>
        u.id === me ? { ...u, answersGiven: u.answersGiven + 1 } : u,
      ),
    }));
    void get().refresh();
  },

  addComment: async (answerId, body) => {
    const me = get().currentUserId;
    if (!me) throw new Error('You must be signed in to comment.');
    const id = await insertComment({ authorId: me, answerId, body });
    const optimistic: Comment = {
      id,
      answerId,
      authorId: me,
      body,
      createdAt: Date.now(),
    };
    set((s) => ({
      comments: [...s.comments, optimistic],
      answers: s.answers.map((a) =>
        a.id === answerId ? { ...a, comments: a.comments + 1 } : a,
      ),
    }));
  },

  loadCommentsFor: async (answerId) => {
    const rows = await fetchCommentsForAnswers([answerId]);
    set((s) => {
      const filtered = s.comments.filter((c) => c.answerId !== answerId);
      const fresh: Comment[] = rows.map((r) => ({
        id: r.id,
        answerId: r.answer_id,
        authorId: r.author_id,
        body: r.body,
        createdAt: new Date(r.created_at).getTime(),
      }));
      return { comments: [...filtered, ...fresh] };
    });
  },

  voteAnswer: (answerId, vote) => {
    const me = get().currentUserId;
    if (!me) return;
    // Optimistic toggle
    set((s) => ({
      answers: s.answers.map((a) => {
        if (a.id !== answerId) return a;
        const prev = a.userVote ?? null;
        let upvotes = a.upvotes;
        let downvotes = a.downvotes;
        if (prev === 'up') upvotes -= 1;
        if (prev === 'down') downvotes -= 1;
        const next = prev === vote ? null : vote;
        if (next === 'up') upvotes += 1;
        if (next === 'down') downvotes += 1;
        return { ...a, upvotes, downvotes, userVote: next };
      }),
    }));
    // Persist via RPC. Server will reconcile counts on next refresh.
    const after = get().answers.find((a) => a.id === answerId);
    const rpcVote: 1 | -1 | 0 = after?.userVote === 'up' ? 1 : after?.userVote === 'down' ? -1 : 0;
    void castVoteRpc(answerId, rpcVote).catch(() => {
      // revert on failure
      void get().refresh();
    });
  },

  toggleFollowTopic: (topicId) => {
    const me = get().currentUserId;
    if (!me) return;
    const wasFollowing = get().followedTopicIds.includes(topicId);
    set((s) => ({
      followedTopicIds: wasFollowing
        ? s.followedTopicIds.filter((t) => t !== topicId)
        : [...s.followedTopicIds, topicId],
      topics: s.topics.map((t) =>
        t.id === topicId
          ? { ...t, followers: Math.max(0, t.followers + (wasFollowing ? -1 : 1)) }
          : t,
      ),
    }));
    void toggleTopicFollowDb(me, topicId, !wasFollowing).catch(() => void get().refresh());
  },

  toggleFollowQuestion: (questionId) => {
    const me = get().currentUserId;
    if (!me) return;
    const wasFollowing = get().followedQuestionIds.includes(questionId);
    set((s) => ({
      followedQuestionIds: wasFollowing
        ? s.followedQuestionIds.filter((q) => q !== questionId)
        : [...s.followedQuestionIds, questionId],
      questions: s.questions.map((q) =>
        q.id === questionId
          ? { ...q, followers: Math.max(0, q.followers + (wasFollowing ? -1 : 1)) }
          : q,
      ),
    }));
    void toggleQuestionFollowDb(me, questionId, !wasFollowing).catch(() => void get().refresh());
  },

  toggleFollowUser: (userId) => {
    const me = get().currentUserId;
    if (!me || userId === me) return;
    const wasFollowing = get().followedUserIds.includes(userId);
    set((s) => ({
      followedUserIds: wasFollowing
        ? s.followedUserIds.filter((u) => u !== userId)
        : [...s.followedUserIds, userId],
    }));
    void toggleUserFollowDb(me, userId, !wasFollowing).catch(() => void get().refresh());
  },

  markNotificationsRead: () => {
    const me = get().currentUserId;
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    if (me) void markAllNotificationsRead(me).catch(() => undefined);
  },

  recordView: (questionId) => {
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === questionId ? { ...q, views: q.views + 1 } : q,
      ),
    }));
    void bumpQuestionViews(questionId).catch(() => undefined);
  },

  runSearch: async (q) => {
    set({ searchQuery: q, searchLoading: true });
    if (!q.trim()) {
      set({ searchResults: [], searchLoading: false });
      return;
    }
    try {
      const rows = await searchQuestionsRpc(q);
      const links = await fetchQuestionTopicLinks();
      const topicIdsByQ = new Map<string, string[]>();
      for (const l of links) {
        const arr = topicIdsByQ.get(l.question_id) ?? [];
        arr.push(l.topic_id);
        topicIdsByQ.set(l.question_id, arr);
      }
      set({
        searchResults: rows.map((r) => questionViewToQuestion(r, topicIdsByQ.get(r.id) ?? [])),
        searchLoading: false,
      });
    } catch {
      set({ searchResults: [], searchLoading: false });
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),
}));

// Selectors
export const selectUserById =
  (id: string) =>
  (s: ReturnType<typeof useStore.getState>) =>
    s.users.find((u) => u.id === id);
export const selectTopicById =
  (id: string) =>
  (s: ReturnType<typeof useStore.getState>) =>
    s.topics.find((t) => t.id === id);
export const selectCommentsForAnswer =
  (answerId: string) =>
  (s: ReturnType<typeof useStore.getState>) =>
    s.comments.filter((c) => c.answerId === answerId);

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(d / 30);
  return `${mo}mo`;
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 < 100 ? 0 : 1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

// ---------- Realtime subscription helpers ----------

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

/**
 * Subscribe to questions/answers/votes/notifications. Each event triggers a
 * targeted refresh by calling refresh() — debounced via a microtask.
 */
let refreshScheduled = false;
function scheduleRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  setTimeout(() => {
    refreshScheduled = false;
    void useStore.getState().refresh();
  }, 400);
}

export function subscribeRealtime(userId: string) {
  unsubscribeRealtime();
  realtimeChannel = supabase
    .channel('imakwa-data')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'questions' },
      scheduleRefresh,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'answers' },
      scheduleRefresh,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'answer_votes' },
      scheduleRefresh,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      scheduleRefresh,
    )
    .subscribe();
}

export function unsubscribeRealtime() {
  if (realtimeChannel) {
    void supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

export { ensureMyProfile };
