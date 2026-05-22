import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SEState = 'Abia' | 'Anambra' | 'Ebonyi' | 'Enugu' | 'Imo';

export type Topic = {
  id: string;
  name: string;
  description: string;
  followers: number;
  state?: SEState | 'Regional';
  category: 'State' | 'Issue';
};

export type User = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  state: SEState;
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

export type Notification = {
  id: string;
  type: 'answer' | 'upvote' | 'follow' | 'mention' | 'comment';
  actorId: string;
  questionId?: string;
  message: string;
  createdAt: number;
  read: boolean;
};

const now = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const TOPICS: Topic[] = [
  // States
  {
    id: 't-abia',
    name: 'Abia',
    description: 'Politics & governance in Abia State',
    followers: 12_400,
    state: 'Abia',
    category: 'State',
  },
  {
    id: 't-anambra',
    name: 'Anambra',
    description: 'Politics & governance in Anambra State',
    followers: 28_900,
    state: 'Anambra',
    category: 'State',
  },
  {
    id: 't-ebonyi',
    name: 'Ebonyi',
    description: 'Politics & governance in Ebonyi State',
    followers: 9_800,
    state: 'Ebonyi',
    category: 'State',
  },
  {
    id: 't-enugu',
    name: 'Enugu',
    description: 'Politics & governance in Enugu State',
    followers: 21_300,
    state: 'Enugu',
    category: 'State',
  },
  {
    id: 't-imo',
    name: 'Imo',
    description: 'Politics & governance in Imo State',
    followers: 18_500,
    state: 'Imo',
    category: 'State',
  },
  // Issues
  {
    id: 't-security',
    name: 'Security & IPOB',
    description: 'Insecurity, sit-at-home orders, and rights of South East citizens',
    followers: 41_200,
    state: 'Regional',
    category: 'Issue',
  },
  {
    id: 't-infrastructure',
    name: 'Infrastructure',
    description: 'Roads, electricity, water, and the Second Niger Bridge',
    followers: 33_700,
    state: 'Regional',
    category: 'Issue',
  },
  {
    id: 't-education',
    name: 'Education',
    description: 'Schools, ASUU, and youth empowerment in the South East',
    followers: 19_500,
    state: 'Regional',
    category: 'Issue',
  },
  {
    id: 't-elections',
    name: 'Elections & INEC',
    description: 'Voter accountability, INEC, and free and fair elections',
    followers: 27_100,
    state: 'Regional',
    category: 'Issue',
  },
  {
    id: 't-economy',
    name: 'Economy & Trade',
    description: 'Onitsha & Aba markets, SMEs, and economic policy',
    followers: 22_800,
    state: 'Regional',
    category: 'Issue',
  },
  {
    id: 't-corruption',
    name: 'Corruption',
    description: 'Holding leaders accountable for public funds',
    followers: 38_400,
    state: 'Regional',
    category: 'Issue',
  },
  {
    id: 't-biafra',
    name: 'Igbo Identity',
    description: 'Cultural heritage, marginalization, and self-determination',
    followers: 45_600,
    state: 'Regional',
    category: 'Issue',
  },
];

const USERS: User[] = [
  {
    id: 'u-1',
    name: 'Chinedu Okeke',
    handle: 'chinedu',
    bio: 'Civic tech advocate. Aba native. Speaking truth to power.',
    state: 'Abia',
    credentials: 'Lawyer at Eze & Associates',
    followers: 4820,
    following: 312,
    questionsAsked: 48,
    answersGiven: 217,
  },
  {
    id: 'u-2',
    name: 'Ngozi Eze',
    handle: 'ngoziwrites',
    bio: 'Journalist. Covering Anambra politics since 2018.',
    state: 'Anambra',
    credentials: 'Senior Reporter, Daily Independent',
    followers: 12_300,
    following: 540,
    questionsAsked: 134,
    answersGiven: 612,
  },
  {
    id: 'u-3',
    name: 'Ikenna Nwosu',
    handle: 'ike_nwosu',
    bio: 'Public policy researcher. Enugu-based.',
    state: 'Enugu',
    credentials: 'Policy Fellow, CDD West Africa',
    followers: 8430,
    following: 198,
    questionsAsked: 27,
    answersGiven: 389,
  },
  {
    id: 'u-4',
    name: 'Adaeze Obi',
    handle: 'adaeze',
    bio: 'Youth organizer. Coordinator at NotTooYoungToRun SE chapter.',
    state: 'Imo',
    followers: 6210,
    following: 422,
    questionsAsked: 73,
    answersGiven: 145,
  },
  {
    id: 'u-5',
    name: 'Emeka Anyanwu',
    handle: 'emekaA',
    bio: 'Engineer & Aba market trader. Asking the questions nobody wants to answer.',
    state: 'Abia',
    followers: 2140,
    following: 87,
    questionsAsked: 91,
    answersGiven: 56,
  },
  {
    id: 'u-6',
    name: 'Chiamaka Okonkwo',
    handle: 'chia_okonkwo',
    bio: 'Economist focused on SE markets and SMEs.',
    state: 'Ebonyi',
    credentials: 'PhD, University of Nigeria Nsukka',
    followers: 5630,
    following: 219,
    questionsAsked: 38,
    answersGiven: 271,
  },
  {
    id: 'u-me',
    name: 'You',
    handle: 'you',
    bio: 'New voice on Imakwa.',
    state: 'Enugu',
    followers: 12,
    following: 38,
    questionsAsked: 0,
    answersGiven: 0,
  },
];

const QUESTIONS: Question[] = [
  {
    id: 'q-1',
    authorId: 'u-2',
    title: 'Why is the Second Niger Bridge still not fully delivering value to the South East after commissioning?',
    body: 'The bridge was commissioned with great fanfare but residents and traders complain about access roads, tolls, and the unfinished Owerri-Onitsha corridor. What is going on, and who do we hold accountable?',
    topicIds: ['t-infrastructure', 't-anambra', 't-corruption'],
    createdAt: now - 4 * HOUR,
    views: 12_840,
    followers: 312,
  },
  {
    id: 'q-2',
    authorId: 'u-1',
    title: 'Should South East governors publicly oppose the Monday sit-at-home order?',
    body: 'The Monday sit-at-home is costing the South East an estimated ₦19 billion every Monday in lost economic activity (per SBM Intelligence). Are our governors doing enough? Should they speak with one voice?',
    topicIds: ['t-security', 't-economy', 't-biafra'],
    createdAt: now - 9 * HOUR,
    views: 28_410,
    followers: 1_204,
  },
  {
    id: 'q-3',
    authorId: 'u-3',
    title: 'How transparent is the Enugu State 2024 budget on capital projects?',
    body: 'Governor Mbah promised disruptive innovation. How do we as citizens track the actual disbursement and execution of capital projects line-by-line?',
    topicIds: ['t-enugu', 't-corruption'],
    createdAt: now - 1 * DAY,
    views: 6_290,
    followers: 184,
  },
  {
    id: 'q-4',
    authorId: 'u-4',
    title: 'What concrete steps has Governor Uzodimma taken to fix Owerri roads in 2025?',
    body: 'Driving through Wetheral and MCC roads is still a nightmare. Beyond the photo ops, where are the actual completed road projects with audited costs?',
    topicIds: ['t-imo', 't-infrastructure'],
    createdAt: now - 2 * DAY,
    views: 9_120,
    followers: 421,
  },
  {
    id: 'q-5',
    authorId: 'u-5',
    title: 'Why do Aba traders pay multiple taxes to multiple agencies?',
    body: 'I run a shop at Ariaria. In one month I paid LGA, state revenue, market union, and a "task force" levy. Is this legal? Who do we petition?',
    topicIds: ['t-abia', 't-economy', 't-corruption'],
    createdAt: now - 3 * DAY,
    views: 14_750,
    followers: 803,
  },
  {
    id: 'q-6',
    authorId: 'u-6',
    title: 'Is Ebonyi State getting fair federal allocation relative to its IGR potential?',
    body: 'Ebonyi has rice, salt, and limestone. Why does it still rank low on HDI in the South East? Is it federal under-allocation, state mismanagement, or both?',
    topicIds: ['t-ebonyi', 't-economy'],
    createdAt: now - 4 * DAY,
    views: 4_120,
    followers: 96,
  },
  {
    id: 'q-7',
    authorId: 'u-2',
    title: 'How can South East youth realistically run for office without godfather backing?',
    body: 'The Not Too Young To Run Act passed in 2018. Six years on, has it actually opened the door for young people in the South East, or is it just symbolism?',
    topicIds: ['t-elections', 't-biafra'],
    createdAt: now - 5 * DAY,
    views: 18_900,
    followers: 612,
  },
  {
    id: 'q-8',
    authorId: 'u-3',
    title: 'Should the South East Development Commission be a game-changer or another slush fund?',
    body: 'The SEDC was signed into law in 2024. What governance structures do we as citizens need to demand to make sure it does not end up like NDDC?',
    topicIds: ['t-corruption', 't-biafra', 't-infrastructure'],
    createdAt: now - 6 * DAY,
    views: 22_300,
    followers: 1_410,
  },
  {
    id: 'q-9',
    authorId: 'u-1',
    title: 'Why are there still no functioning federal universities of agriculture in the SE despite our farming heritage?',
    body: 'Other zones have multiple specialized federal institutions. Is this another example of structural marginalization, or have our reps in NASS simply not pushed?',
    topicIds: ['t-education', 't-biafra'],
    createdAt: now - 7 * DAY,
    views: 7_410,
    followers: 240,
  },
  {
    id: 'q-10',
    authorId: 'u-4',
    title: 'What is the realistic plan to end kidnapping along the Okigwe-Owerri road?',
    body: 'Almost every month there is an incident. What are our reps and the IGP actually doing? What can citizens do beyond complaining on Twitter?',
    topicIds: ['t-security', 't-imo'],
    createdAt: now - 8 * DAY,
    views: 11_530,
    followers: 528,
  },
];

const ANSWERS: Answer[] = [
  {
    id: 'a-1',
    questionId: 'q-1',
    authorId: 'u-3',
    body: 'The bridge itself is largely functional, but Phase 2 — the Onitsha-Owerri-Aba expansion that was supposed to multiply commercial value — was descoped. The contractor (Julius Berger) delivered against the contract terms; the failure is policy. We should pressure the FG to publish the full bridge masterplan with milestones and demand the SEDC fund the missing access road segments. Without that, the bridge is a beautiful ornament.',
    createdAt: now - 3 * HOUR,
    upvotes: 487,
    downvotes: 12,
    comments: 34,
  },
  {
    id: 'a-2',
    questionId: 'q-1',
    authorId: 'u-1',
    body: 'Beyond infrastructure, the toll arrangement is opaque. Citizens deserve to know: who collects, what does it cost to operate, and where does the surplus go? File a Freedom of Information request — I have a template I can share.',
    createdAt: now - 2 * HOUR,
    upvotes: 213,
    downvotes: 4,
    comments: 18,
  },
  {
    id: 'a-3',
    questionId: 'q-2',
    authorId: 'u-3',
    body: "Short answer: yes, with one voice. The economic damage is documented. Governor Otti has spoken; Mbah has spoken; Soludo has spoken — but not coordinated. The SE Governors' Forum should issue a joint communique, fund alternative livelihoods for the boys enforcing it, and prosecute the violent enforcers. Anything less is theatre.",
    createdAt: now - 7 * HOUR,
    upvotes: 1_240,
    downvotes: 89,
    comments: 142,
  },
  {
    id: 'a-4',
    questionId: 'q-2',
    authorId: 'u-6',
    body: 'I ran the numbers on Aba market activity for Q1 2025. Mondays alone account for an estimated 16% loss in weekly turnover for SMEs in Ariaria. This is not just a security issue, it is an existential threat to MSMEs. Governors who refuse to act are choosing politics over their constituents.',
    createdAt: now - 6 * HOUR,
    upvotes: 642,
    downvotes: 21,
    comments: 56,
  },
  {
    id: 'a-5',
    questionId: 'q-3',
    authorId: 'u-2',
    body: 'Enugu has actually published its 2024 budget on the state website, but the line items are aggregated at the MDA level — no contract IDs, no contractor names, no progress photos. BudgIT has built tools for this. We should pressure for project-level disclosure with quarterly performance reports.',
    createdAt: now - 18 * HOUR,
    upvotes: 312,
    downvotes: 7,
    comments: 22,
  },
  {
    id: 'a-6',
    questionId: 'q-5',
    authorId: 'u-1',
    body: "The multiple-taxation regime in Aba is illegal under the 1999 Constitution and the Taxes and Levies (Approved List for Collection) Act. The 'task force' levy especially is extortion. Document who collects, take photos of receipts (or absence of), and report to the Abia State Internal Revenue Service. There is also a class action being prepared by the Aba Chamber of Commerce — I can put you in touch.",
    createdAt: now - 2 * DAY,
    upvotes: 894,
    downvotes: 31,
    comments: 78,
  },
  {
    id: 'a-7',
    questionId: 'q-7',
    authorId: 'u-4',
    body: "The NTYTR Act lowered age limits but did not solve the real barriers: nomination fees (₦40m for governorship in some parties), godfather networks, and INEC's ad-hoc rejections. Real change requires citizen-funded campaigns (we are piloting this in Imo with 1,000+ small donors), ward-level organizing, and primaries reform. Symbolism alone is not enough.",
    createdAt: now - 4 * DAY,
    upvotes: 567,
    downvotes: 18,
    comments: 41,
  },
  {
    id: 'a-8',
    questionId: 'q-8',
    authorId: 'u-2',
    body: "If we let politicians run the SEDC the way they ran NDDC, it dies. Three demands now: (1) Open procurement portal — every contract above ₦5m public; (2) Citizen oversight board with rotating members from civil society, not government appointees; (3) Annual independent audit published in plain language. We organize for this BEFORE the board is constituted. After that, it is too late.",
    createdAt: now - 5 * DAY,
    upvotes: 1_780,
    downvotes: 42,
    comments: 203,
  },
  {
    id: 'a-9',
    questionId: 'q-4',
    authorId: 'u-5',
    body: "I live in Owerri. The Wetheral palliatives done in March collapsed by May. The state contracts office has not published the contractor or cost. Until we get procurement transparency, every road project is a slush fund waiting to happen.",
    createdAt: now - 1 * DAY,
    upvotes: 421,
    downvotes: 8,
    comments: 29,
  },
  {
    id: 'a-10',
    questionId: 'q-10',
    authorId: 'u-3',
    body: 'Three things are working in pockets: community vigilante coordination with police, livelihood programs for at-risk youth, and CCTV on key choke points. None of these are scaled. The reps need to push for a federal Joint Task Force with clear KPIs and quarterly public reporting. Citizens can crowdsource an incident map — there is an open-source one running already.',
    createdAt: now - 7 * DAY,
    upvotes: 389,
    downvotes: 14,
    comments: 47,
  },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    type: 'answer',
    actorId: 'u-2',
    questionId: 'q-2',
    message: 'Ngozi Eze answered your question about the sit-at-home order',
    createdAt: now - 1 * HOUR,
    read: false,
  },
  {
    id: 'n-2',
    type: 'upvote',
    actorId: 'u-3',
    questionId: 'q-5',
    message: 'Ikenna Nwosu and 12 others upvoted your answer',
    createdAt: now - 3 * HOUR,
    read: false,
  },
  {
    id: 'n-3',
    type: 'follow',
    actorId: 'u-1',
    message: 'Chinedu Okeke started following you',
    createdAt: now - 8 * HOUR,
    read: false,
  },
  {
    id: 'n-4',
    type: 'mention',
    actorId: 'u-4',
    questionId: 'q-7',
    message: 'Adaeze Obi mentioned you in an answer about youth running for office',
    createdAt: now - 1 * DAY,
    read: true,
  },
  {
    id: 'n-5',
    type: 'comment',
    actorId: 'u-6',
    questionId: 'q-3',
    message: 'Chiamaka Okonkwo commented on your answer',
    createdAt: now - 2 * DAY,
    read: true,
  },
];

type Store = {
  topics: Topic[];
  users: User[];
  questions: Question[];
  answers: Answer[];
  notifications: Notification[];
  followedTopicIds: string[];
  followedUserIds: string[];
  followedQuestionIds: string[];
  currentUserId: string;
  // actions
  addQuestion: (input: { title: string; body: string; topicIds: string[] }) => string;
  addAnswer: (questionId: string, body: string) => void;
  voteAnswer: (answerId: string, vote: 'up' | 'down') => void;
  toggleFollowTopic: (topicId: string) => void;
  toggleFollowQuestion: (questionId: string) => void;
  toggleFollowUser: (userId: string) => void;
  markNotificationsRead: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      topics: TOPICS,
      users: USERS,
      questions: QUESTIONS,
      answers: ANSWERS,
      notifications: NOTIFICATIONS,
      followedTopicIds: ['t-anambra', 't-corruption', 't-security', 't-infrastructure'],
      followedUserIds: ['u-1', 'u-2'],
      followedQuestionIds: ['q-2', 'q-8'],
      currentUserId: 'u-me',

      addQuestion: ({ title, body, topicIds }) => {
        const id = `q-${Date.now()}`;
        const me = get().currentUserId;
        const question: Question = {
          id,
          authorId: me,
          title,
          body,
          topicIds,
          createdAt: Date.now(),
          views: 1,
          followers: 1,
          isFollowing: true,
        };
        set((s) => ({
          questions: [question, ...s.questions],
          followedQuestionIds: [id, ...s.followedQuestionIds],
          users: s.users.map((u) =>
            u.id === me ? { ...u, questionsAsked: u.questionsAsked + 1 } : u,
          ),
        }));
        return id;
      },

      addAnswer: (questionId, body) => {
        const me = get().currentUserId;
        const answer: Answer = {
          id: `a-${Date.now()}`,
          questionId,
          authorId: me,
          body,
          createdAt: Date.now(),
          upvotes: 0,
          downvotes: 0,
          comments: 0,
        };
        set((s) => ({
          answers: [answer, ...s.answers],
          users: s.users.map((u) =>
            u.id === me ? { ...u, answersGiven: u.answersGiven + 1 } : u,
          ),
        }));
      },

      voteAnswer: (answerId, vote) => {
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
      },

      toggleFollowTopic: (topicId) =>
        set((s) => ({
          followedTopicIds: s.followedTopicIds.includes(topicId)
            ? s.followedTopicIds.filter((t) => t !== topicId)
            : [...s.followedTopicIds, topicId],
        })),

      toggleFollowQuestion: (questionId) =>
        set((s) => ({
          followedQuestionIds: s.followedQuestionIds.includes(questionId)
            ? s.followedQuestionIds.filter((q) => q !== questionId)
            : [...s.followedQuestionIds, questionId],
        })),

      toggleFollowUser: (userId) =>
        set((s) => ({
          followedUserIds: s.followedUserIds.includes(userId)
            ? s.followedUserIds.filter((u) => u !== userId)
            : [...s.followedUserIds, userId],
        })),

      markNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: 'imakwa-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        questions: s.questions,
        answers: s.answers,
        notifications: s.notifications,
        followedTopicIds: s.followedTopicIds,
        followedUserIds: s.followedUserIds,
        followedQuestionIds: s.followedQuestionIds,
      }),
    },
  ),
);

// Selectors
export const selectUserById = (id: string) => (s: ReturnType<typeof useStore.getState>) =>
  s.users.find((u) => u.id === id);
export const selectTopicById = (id: string) => (s: ReturnType<typeof useStore.getState>) =>
  s.topics.find((t) => t.id === id);

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
