import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { Badge, Card, Input, Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCount, useStore, type Topic } from '@/lib/store';

const FILTERS: { key: 'all' | 'State' | 'Issue'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'State', label: 'States' },
  { key: 'Issue', label: 'Issues' },
];

export default function TopicsScreen() {
  const topics = useStore((s) => s.topics);
  const followedTopicIds = useStore((s) => s.followedTopicIds);
  const toggleFollowTopic = useStore((s) => s.toggleFollowTopic);
  const questions = useStore((s) => s.questions);

  const [filter, setFilter] = useState<'all' | 'State' | 'Issue'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      if (filter !== 'all' && t.category !== filter) return false;
      if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [topics, filter, query]);

  const questionCountFor = (topicId: string) =>
    questions.filter((q) => q.topicIds.includes(topicId)).length;

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-3 pb-2 gap-3 bg-background">
        <View className="flex-row items-center gap-2 rounded-lg bg-muted px-3">
          <Search size={16} color="hsl(150 10% 40%)" />
          <Input
            placeholder="Search topics, states, issues..."
            value={query}
            onChangeText={setQuery}
            className="flex-1 border-0 bg-transparent px-0"
          />
        </View>
        <View className="flex-row gap-2">
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-full min-h-[36px] justify-center',
                filter === f.key ? 'bg-primary' : 'bg-secondary',
              )}>
              <Text
                className={cn(
                  'text-[12px] font-semibold',
                  filter === f.key ? 'text-primary-foreground' : 'text-secondary-foreground',
                )}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        // @ts-expect-error estimatedItemSize is valid in FlashList v2
        estimatedItemSize={120}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={({ item }) => (
          <TopicRow
            topic={item}
            questionCount={questionCountFor(item.id)}
            isFollowing={followedTopicIds.includes(item.id)}
            onToggle={() => toggleFollowTopic(item.id)}
          />
        )}
      />
    </View>
  );
}

function TopicRow({
  topic,
  questionCount,
  isFollowing,
  onToggle,
}: {
  topic: Topic;
  questionCount: number;
  isFollowing: boolean;
  onToggle: () => void;
}) {
  return (
    <Link href={`/topic/${topic.id}`} asChild>
      <Pressable>
        <Card className="p-4">
          <View className="flex-row items-start gap-3">
            <View
              className={cn(
                'h-12 w-12 rounded-xl items-center justify-center',
                topic.category === 'State' ? 'bg-accent' : 'bg-primary',
              )}>
              <Text
                className={cn(
                  'text-[16px] font-bold',
                  topic.category === 'State' ? 'text-accent-foreground' : 'text-primary-foreground',
                )}>
                {topic.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-[15px] font-bold text-foreground">{topic.name}</Text>
                <Badge variant="secondary">
                  <Text className="text-[10px] font-semibold text-secondary-foreground">
                    {topic.category}
                  </Text>
                </Badge>
              </View>
              <Text className="text-[12px] text-muted-foreground" numberOfLines={2}>
                {topic.description}
              </Text>
              <Text className="text-[11px] text-muted-foreground">
                {formatCount(topic.followers)} followers · {questionCount} questions
              </Text>
            </View>
            <Pressable
              onPress={onToggle}
              className={cn(
                'px-3 py-2 rounded-full min-h-[36px] justify-center',
                isFollowing ? 'bg-secondary' : 'bg-primary',
              )}>
              <Text
                className={cn(
                  'text-[12px] font-semibold',
                  isFollowing ? 'text-secondary-foreground' : 'text-primary-foreground',
                )}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
