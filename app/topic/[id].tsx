import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Badge, Button, Card, Text } from '@/components/ui';
import { QuestionCard } from '@/components/QuestionCard';
import { cn } from '@/lib/utils';
import { formatCount, useStore } from '@/lib/store';

export default function TopicDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = useStore((s) => s.topics.find((t) => t.id === id));
  const questions = useStore((s) =>
    s.questions
      .filter((q) => q.topicIds.includes(id ?? ''))
      .sort((a, b) => b.followers - a.followers),
  );
  const isFollowing = useStore((s) => s.followedTopicIds.includes(id ?? ''));
  const toggleFollowTopic = useStore((s) => s.toggleFollowTopic);

  if (!topic) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Topic not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={questions}
        keyExtractor={(item) => item.id}
        // @ts-expect-error estimatedItemSize is valid in FlashList v2
        estimatedItemSize={280}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <Card className="p-4 mb-3 gap-3">
            <View className="flex-row items-start gap-3">
              <View
                className={cn(
                  'h-16 w-16 rounded-2xl items-center justify-center',
                  topic.category === 'State' ? 'bg-accent' : 'bg-primary',
                )}>
                <Text
                  className={cn(
                    'text-[20px] font-bold',
                    topic.category === 'State'
                      ? 'text-accent-foreground'
                      : 'text-primary-foreground',
                  )}>
                  {topic.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[20px] font-bold text-foreground">{topic.name}</Text>
                  <Badge variant="secondary">
                    <Text className="text-[10px] font-semibold text-secondary-foreground">
                      {topic.category}
                    </Text>
                  </Badge>
                </View>
                <Text className="text-[12px] text-muted-foreground">{topic.description}</Text>
                <Text className="text-[11px] text-muted-foreground">
                  {formatCount(topic.followers)} followers · {questions.length} questions
                </Text>
              </View>
            </View>
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              onPress={() => toggleFollowTopic(topic.id)}>
              <Text
                className={cn(
                  'text-[13px] font-semibold',
                  isFollowing ? 'text-primary' : 'text-primary-foreground',
                )}>
                {isFollowing ? 'Following' : 'Follow topic'}
              </Text>
            </Button>
          </Card>
        }
        ListEmptyComponent={
          <View className="px-6 py-10 items-center">
            <Text className="text-center text-[13px] text-muted-foreground">
              No questions in this topic yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => <QuestionCard question={item} />}
      />
    </View>
  );
}
