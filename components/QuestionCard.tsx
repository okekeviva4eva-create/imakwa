import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { ArrowDown, ArrowUp, Eye, MessageCircle, Share2, UserPlus } from 'lucide-react-native';

import { Avatar, AvatarFallback, Badge, Card, Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  formatCount,
  formatRelativeTime,
  useStore,
  type Answer,
  type Question,
} from '@/lib/store';

type Props = {
  question: Question;
  className?: string;
};

export function QuestionCard({ question, className }: Props) {
  const author = useStore((s) => s.users.find((u) => u.id === question.authorId));
  const topics = useStore((s) =>
    s.topics.filter((t) => question.topicIds.includes(t.id)),
  );
  const allAnswers = useStore((s) => s.answers);
  const followedQuestionIds = useStore((s) => s.followedQuestionIds);
  const toggleFollowQuestion = useStore((s) => s.toggleFollowQuestion);
  const voteAnswer = useStore((s) => s.voteAnswer);

  const answersForQ = allAnswers.filter((a) => a.questionId === question.id);
  const topAnswer: Answer | undefined = [...answersForQ].toSorted(
    (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
  )[0];
  const topAnswerAuthor = useStore((s) =>
    topAnswer ? s.users.find((u) => u.id === topAnswer.authorId) : undefined,
  );

  const isFollowing = followedQuestionIds.includes(question.id);
  const initials = (author?.name ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <Card className={cn('p-4 gap-3', className)}>
      {/* Topics row */}
      <View className="flex-row flex-wrap gap-1.5">
        {topics.slice(0, 3).map((t) => (
          <Link key={t.id} href={`/topic/${t.id}`} asChild>
            <Pressable>
              <Badge variant="secondary" className="bg-secondary">
                <Text className="text-[11px] font-semibold text-secondary-foreground">
                  {t.name}
                </Text>
              </Badge>
            </Pressable>
          </Link>
        ))}
      </View>

      {/* Title (link) */}
      <Link href={`/question/${question.id}`} asChild>
        <Pressable>
          <Text className="text-[17px] font-bold leading-snug text-foreground">
            {question.title}
          </Text>
        </Pressable>
      </Link>

      {/* Author meta */}
      <View className="flex-row items-center gap-2">
        <Avatar className="h-7 w-7 bg-primary">
          <AvatarFallback>
            <Text className="text-[11px] font-semibold text-primary-foreground">
              {initials}
            </Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text className="text-[12px] text-muted-foreground" numberOfLines={1}>
            <Text className="font-semibold text-foreground">{author?.name ?? 'User'}</Text>
            {author?.credentials ? ` · ${author.credentials}` : ''}
          </Text>
          <Text className="text-[11px] text-muted-foreground">
            Asked {formatRelativeTime(question.createdAt)} · {formatCount(question.views)} views
          </Text>
        </View>
      </View>

      {/* Top answer preview */}
      {topAnswer ? (
        <Link href={`/question/${question.id}`} asChild>
          <Pressable>
            <View className="rounded-lg bg-muted/60 p-3 gap-2">
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                Top answer · {topAnswerAuthor?.name ?? 'User'}
              </Text>
              <Text className="text-[14px] leading-[20px] text-foreground" numberOfLines={4}>
                {topAnswer.body}
              </Text>
              <View className="flex-row items-center gap-3 pt-1">
                <View className="flex-row items-center gap-1">
                  <ArrowUp size={13} color="hsl(150 65% 22%)" />
                  <Text className="text-[11px] font-semibold text-muted-foreground">
                    {formatCount(topAnswer.upvotes)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MessageCircle size={13} color="hsl(150 10% 40%)" />
                  <Text className="text-[11px] font-semibold text-muted-foreground">
                    {topAnswer.comments}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Link>
      ) : (
        <View className="rounded-lg border border-dashed border-border p-3">
          <Text className="text-[13px] italic text-muted-foreground">
            No answers yet — be the first to weigh in.
          </Text>
        </View>
      )}

      {/* Action bar */}
      <View className="flex-row items-center justify-between border-t border-border pt-3">
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => topAnswer && voteAnswer(topAnswer.id, 'up')}
            className="flex-row items-center gap-1 px-2 py-1.5 rounded-md min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel="Upvote">
            <ArrowUp
              size={18}
              color={topAnswer?.userVote === 'up' ? 'hsl(150 65% 22%)' : 'hsl(150 10% 40%)'}
            />
            <Text
              className={cn(
                'text-[12px] font-semibold',
                topAnswer?.userVote === 'up' ? 'text-primary' : 'text-muted-foreground',
              )}>
              Upvote · {formatCount(topAnswer?.upvotes ?? 0)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => topAnswer && voteAnswer(topAnswer.id, 'down')}
            className="px-2 py-1.5 rounded-md min-h-[44px] min-w-[44px] justify-center items-center"
            accessibilityLabel="Downvote">
            <ArrowDown
              size={18}
              color={topAnswer?.userVote === 'down' ? 'hsl(0 75% 50%)' : 'hsl(150 10% 40%)'}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-1">
          <Link href={`/question/${question.id}`} asChild>
            <Pressable
              className="flex-row items-center gap-1 px-2 py-1.5 rounded-md min-h-[44px] justify-center"
              accessibilityLabel="View answers">
              <MessageCircle size={18} color="hsl(150 10% 40%)" />
              <Text className="text-[12px] font-semibold text-muted-foreground">
                {answersForQ.length}
              </Text>
            </Pressable>
          </Link>

          <Pressable
            onPress={() => toggleFollowQuestion(question.id)}
            className="flex-row items-center gap-1 px-2 py-1.5 rounded-md min-h-[44px] justify-center"
            accessibilityLabel="Follow question">
            <UserPlus
              size={18}
              color={isFollowing ? 'hsl(150 65% 22%)' : 'hsl(150 10% 40%)'}
            />
          </Pressable>

          <Pressable
            className="px-2 py-1.5 rounded-md min-h-[44px] min-w-[44px] justify-center items-center"
            accessibilityLabel="Share">
            <Share2 size={18} color="hsl(150 10% 40%)" />
          </Pressable>

          <View className="flex-row items-center gap-1 px-2 py-1.5">
            <Eye size={14} color="hsl(150 10% 40%)" />
            <Text className="text-[11px] text-muted-foreground">
              {formatCount(question.followers)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
