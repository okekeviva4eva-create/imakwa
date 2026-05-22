import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AskTab() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/ask');
  }, [router]);
  return null;
}
