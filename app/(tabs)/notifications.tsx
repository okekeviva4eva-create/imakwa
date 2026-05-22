import { FlashList } from '@shopify/flash-list';
import { useEffect } from 'react';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import {
  ArrowUp,
  AtSign,
  MessageCircle,
  MessageSquare,
  UserPlus,
} from 'lucide-react-native';

import { Avatar, AvatarFallback, Card, Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatRelativeTime, useStore, type Notification } from '@/lib/store';

const ICONS = {
  answer: MessageSquare,
  upvote: ArrowUp,
  follow: UserPlus,
  mention: AtSign,
  comment: MessageCircle,
} as const;

export default function NotificationsScreen() {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationsRead);
  const users = useStore((s) => s.users);

  useEffect(() => {
    const t = setTimeout(() => markRead(), 1500);
    return () => clearTimeout(t);
  }, [markRead]);

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={notifications}
        keyExtractor={(item) => item.id}
        // @ts-expect-error estimatedItemSize is valid in FlashList v2
        estimatedItemSize={88}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={
          <View className="px-6 py-16 items-center">
            <Text className="text-center text-[14px] text-muted-foreground">
              No activity yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Row notification={item} actor={users.find((u) => u.id === item.actorId)} />
        )}
      />
    </View>
  );
}

function Row({
  notification,
  actor,
}: {
  notification: Notification;
  actor?: ReturnType<typeof useStore.getState>['users'][number];
}) {
  const Icon = ICONS[notification.type];
  const initials = (actor?.name ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  const content = (
    <Card className={cn('p-4 flex-row items-start gap-3', !notification.read && 'border-primary/40')}>
      <View className="relative">
        <Avatar className="h-10 w-10 bg-primary">
          <AvatarFallback>
            <Text className="text-[12px] font-semibold text-primary-foreground">
              {initials}
            </Text>
          </AvatarFallback>
        </Avatar>
        <View
          className={cn(
            'absolute -bottom-1 -right-1 h-5 w-5 rounded-full items-center justify-center',
            notification.type === 'upvote'
              ? 'bg-primary'
              : notification.type === 'mention'
                ? 'bg-accent'
                : 'bg-card border border-border',
          )}>
          <Icon
            size={11}
            color={
              notification.type === 'upvote'
                ? 'hsl(0 0% 100%)'
                : notification.type === 'mention'
                  ? 'hsl(150 40% 12%)'
                  : 'hsl(150 30% 8%)'
            }
          />
        </View>
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-[14px] leading-[20px] text-foreground">
          {notification.message}
        </Text>
        <Text className="text-[11px] text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>
      {!notification.read && <View className="h-2 w-2 rounded-full bg-primary mt-2" />}
    </Card>
  );

  if (notification.questionId) {
    return (
      <Link href={`/question/${notification.questionId}`} asChild>
        <Pressable>{content}</Pressable>
      </Link>
    );
  }
  return content;
}
