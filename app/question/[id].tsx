import { FlashList } from '@shopify/flash-list';
import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { ArrowDown, ArrowUp, MessageCircle, Share2, UserPlus } from 'lucide-react-native';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Input,
  Separator,
  Text,
  useToast,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  formatCount,
  formatRelativeTime,
  useStore,
  type Answer,
} from '@/lib/store';

type Sort = 'top' | 'recent';

export default function QuestionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = useStore((s) => s.questions.find((q) => q.id === id));
  const author = useStore((s) =>
    question ? s.users.find((u) => u.id === question.authorId) : undefined,
  );
  const topics = useStore((s) =>
    question ? s.topics.filter((t) => question.topicIds.includes(t.id)) : [],
  );
  const allAnswers = useStore((s) => s.answers.filter((a) => a.questionId === id));
  const users = useStore((s) => s.users);
  const followedQuestionIds = useStore((s) => s.followedQuestionIds);
  const toggleFollowQuestion = useStore((s) => s.toggleFollowQuestion);
  const voteAnswer = useStore((s) => s.voteAnswer);
  const addAnswer = useStore((s) => s.addAnswer);
  const toast = useToast();

  const [sort, setSort] = useState<Sort>('top');
  const [draft, setDraft] = useState('');
  const [composing, setComposing] = useState(false);

  const sorted = useMemo(() => {
    const list = [...allAnswers];
    if (sort === 'top') {
      return list.toSorted((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    }
    return list.toSorted((a, b) => b.createdAt - a.createdAt);
  }, [allAnswers, sort]);

  if (!question) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Question not found.</Text>
      </View>
    );
  }

  const isFollowing = followedQuestionIds.includes(question.id);

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={sorted}
        keyExtractor={(item) => item.id}
        // @ts-expect-error estimatedItemSize is valid in FlashList v2
        estimatedItemSize={220}
        contentContainerStyle={{ paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View className="h-2 bg-muted/30" />}
        ListHeaderComponent={
          <ScrollView>
            <View className="bg-card p-4 gap-3 border-b border-border">
              <View className="flex-row flex-wrap gap-1.5">
                {topics.map((t) => (
                  <Link key={t.id} href={`/topic/${t.id}`} asChild>
                    <Pressable>
                      <Badge variant="secondary">
                        <Text className="text-[11px] font-semibold text-secondary-foreground">
                          {t.name}
                        </Text>
                      </Badge>
                    </Pressable>
                  </Link>
                ))}
              </View>

              <Text className="text-[20px] font-bold leading-[26px] text-foreground">
                {question.title}
              </Text>

              <View className="flex-row items-center gap-2 pt-1">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>
                    <Text className="text-[12px] font-semibold text-primary-foreground">
                      {(author?.name ?? 'U')
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')}
                    </Text>
                  </AvatarFallback>
                </Avatar>
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-foreground">
                    {author?.name ?? 'User'}
                  </Text>
                  {author?.credentials ? (
                    <Text className="text-[11px] text-muted-foreground">{author.credentials}</Text>
                  ) : null}
                </View>
                <Text className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(question.createdAt)}
                </Text>
              </View>

              <Text className="text-[14px] leading-[22px] text-foreground">{question.body}</Text>

              <View className="flex-row items-center gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  onPress={() => toggleFollowQuestion(question.id)}>
                  <View className="flex-row items-center gap-1">
                    <UserPlus
                      size={14}
                      color={isFollowing ? 'hsl(150 65% 22%)' : 'hsl(0 0% 100%)'}
                    />
                    <Text
                      className={cn(
                        'text-[12px] font-semibold',
                        isFollowing ? 'text-primary' : 'text-primary-foreground',
                      )}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </View>
                </Button>
                <Button size="sm" variant="outline">
                  <View className="flex-row items-center gap-1">
                    <Share2 size={14} color="hsl(150 30% 8%)" />
                    <Text className="text-[12px] font-semibold">Share</Text>
                  </View>
                </Button>
                <View className="flex-1" />
                <Text className="text-[11px] text-muted-foreground">
                  {formatCount(question.followers)} followers · {formatCount(question.views)} views
                </Text>
              </View>
            </View>

            {/* Answer composer */}
            <View className="bg-background px-4 pt-4 pb-2 gap-2 border-b border-border">
              <Text className="text-[15px] font-bold text-foreground">
                {allAnswers.length} {allAnswers.length === 1 ? 'Answer' : 'Answers'}
              </Text>
              {composing ? (
                <View className="gap-2">
                  <Input
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Share your perspective. Cite sources where possible."
                    multiline
                    className="min-h-[120px] py-3"
                    style={{ textAlignVertical: 'top' }}
                  />
                  <View className="flex-row gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        setComposing(false);
                        setDraft('');
                      }}>
                      <Text className="text-[13px] font-semibold">Cancel</Text>
                    </Button>
                    <Button
                      size="sm"
                      disabled={draft.trim().length < 10}
                      onPress={() => {
                        addAnswer(question.id, draft.trim());
                        setDraft('');
                        setComposing(false);
                        toast.toast({
                          title: 'Answer posted',
                          description: 'Your voice is part of the conversation.',
                          variant: 'success',
                        });
                      }}>
                      <Text className="text-[13px] font-semibold text-primary-foreground">
                        Post answer
                      </Text>
                    </Button>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setComposing(true)}
                  className="rounded-lg border border-border bg-muted/40 p-3 min-h-[44px] justify-center">
                  <Text className="text-[13px] text-muted-foreground">
                    Add an answer · be specific, cite sources, hold power accountable
                  </Text>
                </Pressable>
              )}

              <View className="flex-row gap-1 pt-2">
                {(['top', 'recent'] as Sort[]).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSort(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-full',
                      sort === s ? 'bg-primary' : 'bg-secondary',
                    )}>
                    <Text
                      className={cn(
                        'text-[12px] font-semibold capitalize',
                        sort === s ? 'text-primary-foreground' : 'text-secondary-foreground',
                      )}>
                      {s === 'top' ? 'Top' : 'Recent'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        }
        ListEmptyComponent={
          <View className="px-6 py-10 items-center">
            <Text className="text-center text-[13px] text-muted-foreground">
              No answers yet. Be the first to weigh in.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AnswerCard
            answer={item}
            author={users.find((u) => u.id === item.authorId)}
            onVote={(v) => voteAnswer(item.id, v)}
          />
        )}
      />
    </View>
  );
}

function AnswerCard({
  answer,
  author,
  onVote,
}: {
  answer: Answer;
  author?: ReturnType<typeof useStore.getState>['users'][number];
  onVote: (v: 'up' | 'down') => void;
}) {
  const initials = (author?.name ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <View className="bg-card p-4 gap-3">
      <View className="flex-row items-center gap-2">
        <Avatar className="h-9 w-9 bg-primary">
          <AvatarFallback>
            <Text className="text-[12px] font-semibold text-primary-foreground">{initials}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text className="text-[13px] font-semibold text-foreground">
            {author?.name ?? 'User'}
          </Text>
          <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
            {author?.credentials ?? `${author?.state ?? ''} · ${formatCount(author?.followers ?? 0)} followers`}
          </Text>
        </View>
        <Text className="text-[11px] text-muted-foreground">
          {formatRelativeTime(answer.createdAt)}
        </Text>
      </View>

      <Text className="text-[14px] leading-[22px] text-foreground">{answer.body}</Text>

      <Separator />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center bg-secondary rounded-full">
          <Pressable
            onPress={() => onVote('up')}
            className="flex-row items-center gap-1 pl-3 pr-2 py-2 min-h-[40px]"
            accessibilityLabel="Upvote answer">
            <ArrowUp
              size={16}
              color={answer.userVote === 'up' ? 'hsl(150 65% 22%)' : 'hsl(150 10% 40%)'}
            />
            <Text
              className={cn(
                'text-[12px] font-semibold',
                answer.userVote === 'up' ? 'text-primary' : 'text-secondary-foreground',
              )}>
              Upvote · {formatCount(answer.upvotes)}
            </Text>
          </Pressable>
          <View className="h-5 w-px bg-border" />
          <Pressable
            onPress={() => onVote('down')}
            className="px-3 py-2 min-h-[40px] min-w-[40px] items-center justify-center"
            accessibilityLabel="Downvote answer">
            <ArrowDown
              size={16}
              color={answer.userVote === 'down' ? 'hsl(0 75% 50%)' : 'hsl(150 10% 40%)'}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable className="flex-row items-center gap-1 px-3 py-2 rounded-full bg-secondary min-h-[40px]">
            <MessageCircle size={14} color="hsl(150 10% 40%)" />
            <Text className="text-[12px] font-semibold text-secondary-foreground">
              {answer.comments}
            </Text>
          </Pressable>
          <Pressable
            className="px-3 py-2 rounded-full bg-secondary min-h-[40px] min-w-[40px] items-center justify-center"
            accessibilityLabel="Share answer">
            <Share2 size={14} color="hsl(150 10% 40%)" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
