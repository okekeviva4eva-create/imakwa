import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

import { Button, Input, Separator, Text } from '@/components/ui';
import { useAuthStore } from '@/lib/authStore';

export default function SignInScreen() {
  const signIn = useAuthStore((s) => s.signInWithPassword);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signIn(trimmed, password);
    setSubmitting(false);
    if (err) {
      // If account needs email verification, push to OTP screen
      if (err.toLowerCase().includes('verify')) {
        router.push('/(auth)/verify-otp');
        return;
      }
      setError(err);
    }
  };

  const onSendCode = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setError('Enter your email above first to receive a code.');
      return;
    }
    setOtpSubmitting(true);
    const { error: err } = await sendOtp(trimmed);
    setOtpSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    router.push('/(auth)/verify-otp');
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

          <View className="mt-6 gap-2">
            <Text className="text-[28px] font-bold text-foreground">Welcome back</Text>
            <Text className="text-[14px] text-muted-foreground leading-[20px]">
              Sign in to continue the conversation on Imakwa.
            </Text>
          </View>

          <View className="mt-8 gap-4">
            <View className="gap-2">
              <Text className="text-[13px] font-semibold text-foreground">Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View className="gap-2">
              <Text className="text-[13px] font-semibold text-foreground">Password</Text>
              <View className="relative">
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1.5 h-10 w-10 items-center justify-center">
                  {showPassword ? (
                    <EyeOff size={18} color="hsl(150 10% 50%)" />
                  ) : (
                    <Eye size={18} color="hsl(150 10% 50%)" />
                  )}
                </Pressable>
              </View>
            </View>

            {error && <Text className="text-[12px] text-destructive">{error}</Text>}

            <Button size="lg" onPress={onSubmit} disabled={submitting}>
              <Text className="text-[15px] font-bold text-primary-foreground">
                {submitting ? 'Signing in…' : 'Sign in'}
              </Text>
            </Button>

            <View className="flex-row items-center gap-3 my-1">
              <Separator className="flex-1" />
              <Text className="text-[11px] uppercase tracking-wide text-muted-foreground">or</Text>
              <Separator className="flex-1" />
            </View>

            <Button variant="outline" size="lg" onPress={onSendCode} disabled={otpSubmitting}>
              <Text className="text-[14px] font-semibold text-foreground">
                {otpSubmitting ? 'Sending code…' : 'Email me a 6-digit code'}
              </Text>
            </Button>
          </View>

          <View className="flex-1" />

          <View className="flex-row items-center justify-center gap-1 pt-6">
            <Text className="text-[13px] text-muted-foreground">New to Imakwa?</Text>
            <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
              <Text className="text-[13px] font-semibold text-primary">Create account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
