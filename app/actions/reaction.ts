// app/actions/reaction.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { toggleReaction, toggleCommentReaction } from '@/lib/github';

export async function reactToPost(postId: string, emoji: string) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const user = session.user as any;
  try {
    const reactions = await toggleReaction(postId, user.id, emoji);
    revalidatePath(`/posts/${postId}`);
    return { success: true, reactions };
  } catch (e: any) {
    return { error: e.message ?? '리액션 처리에 실패했습니다.' };
  }
}

export async function reactToComment(
  postId: string,
  commentId: string,
  emoji: string,
  replyId?: string,
) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const user = session.user as any;
  try {
    const reactions = await toggleCommentReaction(postId, commentId, user.id, emoji, replyId);
    revalidatePath(`/posts/${postId}`);
    return { success: true, reactions };
  } catch (e: any) {
    return { error: e.message ?? '리액션 처리에 실패했습니다.' };
  }
}