import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Check, X } from 'lucide-react-native';

import { Badge, Button, Card, Input, Text, useToast } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

export default function AskScreen() {
  const router = useRouter();
  const topics = useStore((s) => s.topics);
  const addQuestion = useStore((s) => s.addQuestion);
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const titleOk = title.trim().length >= 15 && title.trim().endsWith('?');
  const topicsOk = selectedTopicIds.length > 0 && selectedTopicIds.length <= 5;
  const canPost = titleOk && topicsOk && !posting;

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const onPost = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      const id = await addQuestion({
        title: title.trim(),
        body: body.trim(),
        topicIds: selectedTopicIds,
      });
      toast.toast({
        title: 'Question posted',
        description: 'The community will weigh in shortly.',
        variant: 'success',
      });
      router.replace(`/question/${id}`);
    } catch (e) {
      toast.toast({
        title: 'Could not post',
        description: e instanceof Error ? e.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPosting(false);
    }
  };

  const stateTopics = topics.filter((t) => t.category === 'State');
  const issueTopics = topics.filter((t) => t.category === 'Issue');

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-secondary items-center justify-center"
          accessibilityLabel="Close">
          <X size={18} color="hsl(150 30% 8%)" />
        </Pressable>
        <Text className="text-[16px] font-bold">Ask a question</Text>
        <Button size="sm" disabled={!canPost} onPress={() => void onPost()}>
          <Text
            className={cn(
              'text-[13px] font-semibold',
              canPost ? 'text-primary-foreground' : 'text-muted-foreground',
            )}>
            {posting ? 'Posting...' : 'Post'}
          </Text>
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }} className="flex-1">
        <View className="gap-5">
          <Card className="p-4 gap-2 bg-accent/15 border-accent/30">
            <Text className="text-[13px] font-bold text-foreground">
              Imakwa is for accountability
            </Text>
            <Text className="text-[12px] leading-[18px] text-foreground/80">
              Be specific. Name the office, the project, the policy. Avoid attacks on individuals;
              focus on actions, decisions, and outcomes. Cite sources where possible.
            </Text>
          </Card>

          <View className="gap-2">
            <Text className="text-[13px] font-semibold text-foreground">
              Question <Text className="text-destructive">*</Text>
            </Text>
            <Text className="text-[11px] text-muted-foreground">
              Start with a question word. End with a question mark.
            </Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Why has the Ariaria market expansion stalled since 2023?"
              multiline
              className="min-h-[60px] py-3"
              style={{ textAlignVertical: 'top' }}
            />
            <View className="flex-row items-center gap-2">
              <Check
                size={12}
                color={titleOk ? 'hsl(150 65% 22%)' : 'hsl(150 10% 60%)'}
              />
              <Text
                className={cn(
                  'text-[11px]',
                  titleOk ? 'text-primary' : 'text-muted-foreground',
                )}>
                15+ characters and ends with &quot;?&quot;
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-[13px] font-semibold text-foreground">
              Context <Text className="text-muted-foreground">(optional)</Text>
            </Text>
            <Input
              value={body}
              onChangeText={setBody}
              placeholder="Add background, links to sources, or specific incidents that prompted the question."
              multiline
              className="min-h-[120px] py-3"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          <View className="gap-2">
            <Text className="text-[13px] font-semibold text-foreground">
              Topics <Text className="text-destructive">*</Text>
            </Text>
            <Text className="text-[11px] text-muted-foreground">
              Select 1–5 topics. {selectedTopicIds.length}/5 selected.
            </Text>

            <Text className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              States
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {stateTopics.map((t) => (
                <TopicChip
                  key={t.id}
                  label={t.name}
                  selected={selectedTopicIds.includes(t.id)}
                  onPress={() => toggleTopic(t.id)}
                />
              ))}
            </View>

            <Text className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Issues
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {issueTopics.map((t) => (
                <TopicChip
                  key={t.id}
                  label={t.name}
                  selected={selectedTopicIds.includes(t.id)}
                  onPress={() => toggleTopic(t.id)}
                />
              ))}
            </View>
          </View>

          {selectedTopicIds.length > 0 && (
            <View className="gap-2">
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Selected
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedTopicIds.map((id) => {
                  const t = topics.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <Pressable key={id} onPress={() => toggleTopic(id)}>
                      <Badge className="bg-primary">
                        <View className="flex-row items-center gap-1">
                          <Text className="text-[11px] font-semibold text-primary-foreground">
                            {t.name}
                          </Text>
                          <X size={11} color="hsl(0 0% 100%)" />
                        </View>
                      </Badge>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TopicChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'px-3 py-2 rounded-full border min-h-[36px] justify-center',
        selected ? 'bg-primary border-primary' : 'bg-card border-border',
      )}>
      <Text
        className={cn(
          'text-[12px] font-semibold',
          selected ? 'text-primary-foreground' : 'text-foreground',
        )}>
        {label}
      </Text>
    </Pressable>
  );
}
