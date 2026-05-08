// app/actions/notification.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { getUnreadComments } from '@/lib/github';

export async function fetchNotifications(lastChecked: string) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const user = session.user as any;

  try {
    const unread = await getUnreadComments(user.id, lastChecked);
    return { notifications: unread };
  } catch {
    return { notifications: [] };
  }
}