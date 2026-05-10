// app/actions/bookmark.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { toggleBookmark, getBookmarks } from '@/lib/github';

export async function toggleBookmarkAction(postId: string) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const user = session.user as any;

  try {
    const isBookmarked = await toggleBookmark(user.id, postId);
    revalidatePath(`/posts/${postId}`);
    revalidatePath('/bookmarks');
    return { success: true, isBookmarked };
  } catch (e: any) {
    return { error: e.message ?? '북마크 처리에 실패했습니다.' };
  }
}

export async function fetchMyBookmarks() {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const user = session.user as any;

  try {
    const { bookmarks } = await getBookmarks();
    return { postIds: bookmarks[user.id] ?? [] };
  } catch {
    return { postIds: [] };
  }
}