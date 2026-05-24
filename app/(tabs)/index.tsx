import { useEffect, useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Pressable, View } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { QuestionCard } from '@/components/QuestionCard';
import { Input, Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

type Tab = 'foryou' | 'following' | 'trending';

const TABS: { key: Tab; label: string }[] = [
  { key: 'foryou', label: 'For You' },
  { key: 'following', label: 'Following' },
  { key: 'trending', label: 'Trending' },
];

export default function HomeScreen() {
  const [tab, setTab] = useState<Tab>('foryou');
  const [q, setQ] = useState('');

  const questions = useStore((s) => s.questions);
  const followedTopicIds = useStore((s) => s.followedTopicIds);
  const followedQuestionIds = useStore((s) => s.followedQuestionIds);
  const answers = useStore((s) => s.answers);
  const hydrated = useStore((s) => s.hydrated);
  const loading = useStore((s) => s.loading);
  const searchResults = useStore((s) => s.searchResults);
  const searchQuery = useStore((s) => s.searchQuery);
  const searchLoading = useStore((s) => s.searchLoading);
  const runSearch = useStore((s) => s.runSearch);
  const clearSearch = useStore((s) => s.clearSearch);

  // Debounced server-side search
  useEffect(() => {
    if (!q.trim()) {
      clearSearch();
      return undefined;
    }
    const t = setTimeout(() => {
      void runSearch(q);
    }, 300);
    return () => clearTimeout(t);
  }, [q, runSearch, clearSearch]);

  const sorted = useMemo(() => {
    if (searchQuery.trim()) return searchResults;
    const list = [...questions];
    if (tab === 'foryou') {
      return list.toSorted((a, b) => {
        const aScore =
          a.topicIds.filter((t) => followedTopicIds.includes(t)).length * 1000 - a.createdAt / 1e9;
        const bScore =
          b.topicIds.filter((t) => followedTopicIds.includes(t)).length * 1000 - b.createdAt / 1e9;
        return bScore - aScore;
      });
    }
    if (tab === 'following') {
      return list.filter((qs) => followedQuestionIds.includes(qs.id));
    }
    return list.toSorted((a, b) => {
      const aScore =
        a.followers + answers.filter((x) => x.questionId === a.id).reduce((s, x) => s + x.upvotes, 0);
      const bScore =
        b.followers + answers.filter((x) => x.questionId === b.id).reduce((s, x) => s + x.upvotes, 0);
      return bScore - aScore;
    });
  }, [tab, questions, followedTopicIds, followedQuestionIds, answers, searchQuery, searchResults]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-background">
      {/* Search bar */}
      <View className="px-3 pt-3 pb-2 bg-background">
        <View className="flex-row items-center gap-2 rounded-full bg-muted px-3 py-2 min-h-[44px]">
          <Search size={16} color="hsl(150 10% 40%)" />
          <Input
            value={q}
            onChangeText={setQ}
            placeholder="Search questions, topics, leaders..."
            className="flex-1 border-0 bg-transparent px-0 py-0 h-9"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {q.length > 0 ? (
            <Pressable
              onPress={() => setQ('')}
              className="h-7 w-7 items-center justify-center rounded-full"
              accessibilityLabel="Clear search">
              <X size={14} color="hsl(150 10% 40%)" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Tab strip — hidden during search */}
      {!isSearching ? (
        <View className="flex-row border-b border-border bg-background px-2">
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 min-h-[44px] justify-center items-center',
                tab === t.key && 'border-b-2 border-primary',
              )}
              accessibilityLabel={`${t.label} tab`}>
              <Text
                className={cn(
                  'text-[14px] font-semibold',
                  tab === t.key ? 'text-primary' : 'text-muted-foreground',
                )}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="border-b border-border px-4 py-2">
          <Text className="text-[12px] text-muted-foreground">
            {searchLoading
              ? `Searching for "${searchQuery}"...`
              : `${sorted.length} ${sorted.length === 1 ? 'result' : 'results'} for "${searchQuery}"`}
          </Text>
        </View>
      )}

      <FlashList
        data={sorted}
        keyExtractor={(item) => item.id}
        // @ts-expect-error estimatedItemSize is valid in FlashList v2
        estimatedItemSize={280}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="px-6 py-16 items-center">
            <Text className="text-center text-[14px] text-muted-foreground">
              {!hydrated && loading
                ? 'Loading...'
                : isSearching
                  ? `No questions match "${searchQuery}".`
                  : tab === 'following'
                    ? 'You are not following any questions yet. Tap the follow icon on questions you care about.'
                    : 'No questions yet — be the first to ask.'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          !isSearching ? (
            <View className="mb-3 rounded-xl bg-primary p-4">
              <Text className="text-[12px] font-semibold uppercase tracking-wide text-primary-foreground/70">
                Imakwa
              </Text>
              <Text className="mt-1 text-[16px] font-bold text-primary-foreground leading-snug">
                The South East asks the questions. Power answers — or accounts.
              </Text>
              <Text className="mt-2 text-[12px] text-primary-foreground/80">
                Hold leaders accountable. Ask. Answer. Demand transparency.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <QuestionCard question={item} />}
      />
    </View>
  );
}
