import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MessageSquareQuote, ShieldCheck, Users } from 'lucide-react-native';

import { Button, Text } from '@/components/ui';

export default function LandingScreen() {
  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['hsl(150 65% 22%)', 'hsl(150 40% 35%)', 'hsl(42 70% 55%)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View className="flex-1 px-6 pt-10 justify-between">
            {/* Brand */}
            <View className="gap-3">
              <View className="h-14 w-14 rounded-2xl bg-white/15 items-center justify-center">
                <MessageSquareQuote size={28} color="white" />
              </View>
              <Text className="text-[40px] font-bold text-white tracking-tight">Imakwa</Text>
              <Text className="text-[16px] text-white/85 leading-[22px]">
                The civic Q&A platform for the South East.{'\n'}
                Ask hard questions. Hold leaders accountable.
              </Text>
            </View>

            {/* Highlights */}
            <View className="gap-3">
              <Highlight
                icon={<Users size={18} color="white" />}
                title="Built by citizens"
                body="Join thousands of voices from Abia, Anambra, Ebonyi, Enugu and Imo."
              />
              <Highlight
                icon={<MessageSquareQuote size={18} color="white" />}
                title="Real questions, real answers"
                body="Backed by journalists, lawyers, and civic experts."
              />
              <Highlight
                icon={<ShieldCheck size={18} color="white" />}
                title="Your voice is protected"
                body="Sign in securely with email. We never share your data."
              />
            </View>

            {/* CTAs */}
            <View className="gap-3 pb-2">
              <Button
                size="lg"
                className="bg-white"
                onPress={() => router.push('/(auth)/sign-up')}>
                <Text className="text-[15px] font-bold text-primary">Create account</Text>
              </Button>
              <Pressable
                onPress={() => router.push('/(auth)/sign-in')}
                className="h-12 items-center justify-center rounded-md border border-white/40 bg-white/10">
                <Text className="text-[15px] font-semibold text-white">I already have an account</Text>
              </Pressable>
              <Text className="text-center text-[11px] text-white/70 mt-1">
                By continuing you agree to keep discussions factual and respectful.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function Highlight({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <View className="flex-row gap-3 items-start">
      <View className="h-9 w-9 rounded-lg bg-white/15 items-center justify-center mt-0.5">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-white">{title}</Text>
        <Text className="text-[12px] text-white/80 leading-[16px]">{body}</Text>
      </View>
    </View>
  );
}
