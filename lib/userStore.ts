import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, UserStats, UserBadge } from './types';

interface UserStoreState {
  // User data
  currentUser: UserProfile | null;
  userStats: UserStats | null;
  userBadges: UserBadge[];
  userFollowers: UserProfile[];
  userFollowing: UserProfile[];

  // Actions
  setCurrentUser: (user: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  incrementReputation: (points: number, reason: string) => Promise<void>;
  addBadge: (badge: UserBadge) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
  calculateBadgeLevel: (reputationScore: number) => string;
  reset: () => void;
}

const REPUTATION_THRESHOLDS = {
  'New Citizen': 0,
  'Active Contributor': 51,
  'Community Leader': 201,
  'Trusted Voice': 501,
};

const REPUTATION_POINTS = {
  QUESTION_ASKED: 5,
  ANSWER_GIVEN: 10,
  ANSWER_UPVOTED: 1,
  ANSWER_DOWNVOTED: -2,
  WEEKLY_ACTIVE: 5,
  QUESTION_HELPFUL: 15,
  VERIFIED_EXPERT: 100,
};

export const useUserStore = create<UserStoreState>()(
  subscribeWithSelector((set, get) => ({
    currentUser: null,
    userStats: null,
    userBadges: [],
    userFollowers: [],
    userFollowing: [],

    setCurrentUser: (user: UserProfile) => {
      set({ currentUser: user });
      AsyncStorage.setItem('currentUser', JSON.stringify(user));
    },

    updateUserProfile: async (updates: Partial<UserProfile>) => {
      const { currentUser } = get();
      if (!currentUser) return;

      const updated: UserProfile = { ...currentUser, ...updates };
      set({ currentUser: updated });
      await AsyncStorage.setItem('currentUser', JSON.stringify(updated));

      // TODO: Sync to Supabase
      try {
        // const { data, error } = await supabase
        //   .from('users')
        //   .update(updates)
        //   .eq('id', currentUser.id);
        // if (error) throw error;
      } catch (error) {
        console.error('Failed to update user profile:', error);
      }
    },

    incrementReputation: async (points: number, reason: string) => {
      const { currentUser } = get();
      if (!currentUser) return;

      const newScore = currentUser.reputationScore + points;
      const badgeLevel = get().calculateBadgeLevel(newScore);

      await get().updateUserProfile({
        reputationScore: newScore,
        badgeLevel,
      });

      // TODO: Log reputation change
      console.log(`Reputation updated: +${points} (${reason})`);
    },

    addBadge: async (badge: UserBadge) => {
      const { userBadges } = get();
      if (userBadges.some((b) => b.id === badge.id)) return;

      const updated = [...userBadges, badge];
      set({ userBadges: updated });
      await AsyncStorage.setItem('userBadges', JSON.stringify(updated));
    },

    followUser: async (userId: string) => {
      const { currentUser, userFollowing } = get();
      if (!currentUser || userFollowing.some((u) => u.id === userId)) return;

      // TODO: Add to Supabase
      console.log(`Following user: ${userId}`);
    },

    unfollowUser: async (userId: string) => {
      const { userFollowing } = get();
      const updated = userFollowing.filter((u) => u.id !== userId);
      set({ userFollowing: updated });

      // TODO: Remove from Supabase
      console.log(`Unfollowed user: ${userId}`);
    },

    loadUserProfile: async (userId: string) => {
      try {
        // TODO: Fetch from Supabase
        // const { data, error } = await supabase
        //   .from('users')
        //   .select('*')
        //   .eq('id', userId)
        //   .single();
        // if (error) throw error;
        // set({ currentUser: data as UserProfile });
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    },

    loadUserStats: async (userId: string) => {
      try {
        // TODO: Calculate and fetch user stats from Supabase
        // const stats = await calculateUserStats(userId);
        // set({ userStats: stats });
      } catch (error) {
        console.error('Failed to load user stats:', error);
      }
    },

    calculateBadgeLevel: (reputationScore: number) => {
      if (reputationScore >= REPUTATION_THRESHOLDS['Trusted Voice']) {
        return 'Trusted Voice';
      } else if (reputationScore >= REPUTATION_THRESHOLDS['Community Leader']) {
        return 'Community Leader';
      } else if (reputationScore >= REPUTATION_THRESHOLDS['Active Contributor']) {
        return 'Active Contributor';
      }
      return 'New Citizen';
    },

    reset: () => {
      set({
        currentUser: null,
        userStats: null,
        userBadges: [],
        userFollowers: [],
        userFollowing: [],
      });
      AsyncStorage.removeItem('currentUser');
      AsyncStorage.removeItem('userBadges');
    },
  }))
);

export { REPUTATION_POINTS };
