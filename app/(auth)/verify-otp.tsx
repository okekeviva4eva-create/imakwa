import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MailCheck } from 'lucide-react-native';

import { Button, Input, Text } from '@/components/ui';
import { useAuthStore } from '@/lib/authStore';

export default function VerifyOtpScreen() {
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const pendingMode = useAuthStore((s) => s.pendingMode);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const sendOtp = useAuthStore((s) => s.sendOtp);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!pendingEmail) {
      setError('Missing email. Go back and try again.');
      return;
    }
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await verifyOtp(pendingEmail, code);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    // Auth state listener will redirect to (tabs).
  };

  const onResend = async () => {
    setError(null);
    setResent(false);
    if (!pendingEmail) return;
    setResending(true);
    const { error: err } = await sendOtp(pendingEmail);
    setResending(false);
    if (err) {
      setError(err);
      return;
    }
    setResent(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            className="h-11 w-11 -ml-2 items-center justify-center rounded-full">
            <ArrowLeft size={22} color="hsl(150 30% 8%)" />
          </Pressable>

          <View className="mt-6 gap-3 items-start">
            <View className="h-12 w-12 rounded-2xl bg-primary/10 items-center justify-center">
              <MailCheck size={22} color="hsl(150 65% 22%)" />
            </View>
            <Text className="text-[28px] font-bold text-foreground">Check your email</Text>
            <Text className="text-[14px] text-muted-foreground leading-[20px]">
              {pendingEmail
                ? `We sent a 6-digit code to ${pendingEmail}. Enter it below to ${pendingMode === 'signup' ? 'verify your account' : 'sign in'}.`
                : 'Enter the 6-digit code we sent to your email.'}
            </Text>
          </View>

          <View className="mt-8 gap-4">
            <View className="gap-2">
              <Text className="text-[13px] font-semibold text-foreground">Verification code</Text>
              <Input
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                style={{
                  fontSize: 22,
                  letterSpacing: 6,
                  textAlign: 'center',
                  fontWeight: '700',
                }}
              />
            </View>

            {error && <Text className="text-[12px] text-destructive">{error}</Text>}
            {resent && !error && (
              <Text className="text-[12px] text-primary">A new code has been sent.</Text>
            )}

            <Button size="lg" onPress={onSubmit} disabled={submitting}>
              <Text className="text-[15px] font-bold text-primary-foreground">
                {submitting ? 'Verifying…' : 'Verify and continue'}
              </Text>
            </Button>

            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-[12px] text-muted-foreground">Did not receive the code?</Text>
              <Pressable onPress={onResend} disabled={resending}>
                <Text className="text-[12px] font-semibold text-primary">
                  {resending ? 'Sending…' : 'Resend'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
