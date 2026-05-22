import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Pressable, View } from 'react-native';

import { QuestionCard } from '@/components/QuestionCard';
import { Text } from '@/components/ui';
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
  const questions = useStore((s) => s.questions);
  const followedTopicIds = useStore((s) => s.followedTopicIds);
  const followedQuestionIds = useStore((s) => s.followedQuestionIds);
  const answers = useStore((s) => s.answers);

  const sorted = useMemo(() => {
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
      return list.filter((q) => followedQuestionIds.includes(q.id));
    }
    return list.toSorted((a, b) => {
      const aScore =
        a.followers + answers.filter((x) => x.questionId === a.id).reduce((s, x) => s + x.upvotes, 0);
      const bScore =
        b.followers + answers.filter((x) => x.questionId === b.id).reduce((s, x) => s + x.upvotes, 0);
      return bScore - aScore;
    });
  }, [tab, questions, followedTopicIds, followedQuestionIds, answers]);

  return (
    <View className="flex-1 bg-background">
      {/* Tab strip */}
      <View className="flex-row border-b border-border bg-background px-2 pt-1">
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
              {tab === 'following'
                ? 'You are not following any questions yet. Tap the follow icon on questions you care about.'
                : 'No questions found.'}
            </Text>
          </View>
        }
        ListHeaderComponent={
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
        }
        renderItem={({ item }) => <QuestionCard question={item} />}
      />
    </View>
  );
}
