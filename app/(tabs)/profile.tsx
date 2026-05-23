import { ScrollView, View } from 'react-native';
import { useMemo, useState } from 'react';
import { MapPin, Settings, Shield } from 'lucide-react-native';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  Separator,
  Text,
} from '@/components/ui';
import { QuestionCard } from '@/components/QuestionCard';
import { cn } from '@/lib/utils';
import { formatCount, useStore } from '@/lib/store';
import { Pressable } from 'react-native';

type Tab = 'questions' | 'answers' | 'topics';

export default function ProfileScreen() {
  const [tab, setTab] = useState<Tab>('questions');
  const users = useStore((s) => s.users);
  const meId = useStore((s) => s.currentUserId);
  const questions = useStore((s) => s.questions);
  const answers = useStore((s) => s.answers);
  const topics = useStore((s) => s.topics);
  const followedTopicIds = useStore((s) => s.followedTopicIds);

  const me = useMemo(() => users.find((u) => u.id === meId), [users, meId]);
  const myQuestions = useMemo(
    () => questions.filter((q) => q.authorId === meId),
    [questions, meId],
  );
  const myAnswers = useMemo(
    () => answers.filter((a) => a.authorId === meId),
    [answers, meId],
  );
  const followedTopics = useMemo(
    () => topics.filter((t) => followedTopicIds.includes(t.id)),
    [topics, followedTopicIds],
  );

  if (!me) return null;
  const initials = me.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  const renderTabContent = () => {
    if (tab === 'questions') {
      if (myQuestions.length === 0) {
        return (
          <Card className="p-6 items-center mx-3 my-3">
            <Text className="text-center text-[13px] text-muted-foreground">
              You have not asked any questions yet. Tap Ask to share what is on your mind.
            </Text>
          </Card>
        );
      }
      return (
        <View className="px-3 py-3 gap-3">
          {myQuestions.map((item) => (
            <QuestionCard key={item.id} question={item} />
          ))}
        </View>
      );
    }
    if (tab === 'answers') {
      if (myAnswers.length === 0) {
        return (
          <Card className="p-6 items-center mx-3 my-3">
            <Text className="text-center text-[13px] text-muted-foreground">
              You have not answered any questions yet.
            </Text>
          </Card>
        );
      }
      return (
        <View className="px-3 py-3 gap-3">
          {myAnswers.map((item) => {
            const q = questions.find((x) => x.id === item.questionId);
            return (
              <Card key={item.id} className="p-4 gap-2">
                <Text className="text-[12px] font-semibold text-muted-foreground" numberOfLines={2}>
                  Re: {q?.title ?? 'Question'}
                </Text>
                <Text className="text-[14px] leading-[20px] text-foreground" numberOfLines={4}>
                  {item.body}
                </Text>
                <Text className="text-[11px] text-muted-foreground">
                  {item.upvotes} upvotes · {item.comments} comments
                </Text>
              </Card>
            );
          })}
        </View>
      );
    }
    if (followedTopics.length === 0) {
      return (
        <Card className="p-6 items-center mx-3 my-3">
          <Text className="text-center text-[13px] text-muted-foreground">
            You are not following any topics yet.
          </Text>
        </Card>
      );
    }
    return (
      <View className="px-3 py-3 gap-2">
        {followedTopics.map((item) => (
          <Card key={item.id} className="p-3 flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-lg bg-primary items-center justify-center">
              <Text className="text-[13px] font-bold text-primary-foreground">
                {item.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-foreground">{item.name}</Text>
              <Text className="text-[11px] text-muted-foreground">
                {formatCount(item.followers)} followers
              </Text>
            </View>
          </Card>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-3 gap-4 bg-background">
          <View className="flex-row items-start gap-4">
            <Avatar className="h-20 w-20 bg-primary">
              <AvatarFallback>
                <Text className="text-[24px] font-bold text-primary-foreground">{initials}</Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1 gap-1.5">
              <View className="flex-row items-center gap-2">
                <Text className="text-[20px] font-bold text-foreground">{me.name}</Text>
                <Badge variant="secondary">
                  <Text className="text-[10px] font-semibold text-secondary-foreground">
                    @{me.handle}
                  </Text>
                </Badge>
              </View>
              <View className="flex-row items-center gap-1">
                <MapPin size={12} color="hsl(150 10% 40%)" />
                <Text className="text-[12px] text-muted-foreground">{me.state} State</Text>
              </View>
              <Text className="text-[13px] leading-[18px] text-foreground">{me.bio}</Text>
            </View>
            <Pressable
              className="h-10 w-10 rounded-full bg-secondary items-center justify-center"
              accessibilityLabel="Settings">
              <Settings size={18} color="hsl(150 30% 8%)" />
            </Pressable>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3">
            <Stat label="Questions" value={formatCount(me.questionsAsked)} />
            <Stat label="Answers" value={formatCount(me.answersGiven)} />
            <Stat label="Followers" value={formatCount(me.followers)} />
            <Stat label="Following" value={formatCount(me.following)} />
          </View>

          <Card className="p-3 flex-row items-center gap-3 bg-accent/15 border-accent/30">
            <Shield size={18} color="hsl(42 88% 35%)" />
            <Text className="flex-1 text-[12px] text-foreground">
              Imakwa is a citizen-built platform. Your civic voice matters — keep it factual.
            </Text>
          </Card>

          <View className="flex-row gap-2">
            <Button variant="outline" className="flex-1">
              <Text className="text-[13px] font-semibold">Edit profile</Text>
            </Button>
            <Button variant="outline" className="flex-1">
              <Text className="text-[13px] font-semibold">Share</Text>
            </Button>
          </View>
        </View>

        {/* Tabs (sticky) */}
        <View className="bg-background">
          <Separator />
          <View className="flex-row px-2">
            {(['questions', 'answers', 'topics'] as Tab[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                className={cn(
                  'flex-1 py-3 items-center min-h-[44px] justify-center',
                  tab === t && 'border-b-2 border-primary',
                )}>
                <Text
                  className={cn(
                    'text-[13px] font-semibold capitalize',
                    tab === t ? 'text-primary' : 'text-muted-foreground',
                  )}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
          <Separator />
        </View>

        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-lg bg-secondary py-2 items-center">
      <Text className="text-[15px] font-bold text-foreground">{value}</Text>
      <Text className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Text>
    </View>
  );
}
