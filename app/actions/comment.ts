// app/actions/comment.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { addComment, addReply, deleteComment, deleteReply, generatePostId } from '@/lib/github';
import { z } from 'zod';

const CommentSchema = z.object({
  content: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(1000, '1000자 이내로 입력해주세요.'),
});

export async function createComment(postId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const parsed = CommentSchema.safeParse({ content: formData.get('content') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = session.user as any;
  const comment = {
    id:         generatePostId(),
    authorId:   user.id,
    authorName: user.name,
    content:    parsed.data.content,
    createdAt:  new Date().toISOString(),
  };

  try {
    await addComment(postId, comment);
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? '댓글 작성에 실패했습니다.' };
  }
}

export async function createReply(postId: string, commentId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const parsed = CommentSchema.safeParse({ content: formData.get('content') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = session.user as any;
  const reply = {
    id:         generatePostId(),
    authorId:   user.id,
    authorName: user.name,
    content:    parsed.data.content,
    createdAt:  new Date().toISOString(),
  };

  try {
    await addReply(postId, commentId, reply);
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? '대댓글 작성에 실패했습니다.' };
  }
}

export async function removeComment(postId: string, commentId: string) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const user = session.user as any;
  try {
    await deleteComment(postId, commentId, user.role === 'admin' ? '__admin__' : user.id);
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? '댓글 삭제에 실패했습니다.' };
  }
}

export async function removeReply(postId: string, commentId: string, replyId: string) {
  const session = await auth();
  if (!session?.user) return { error: '로그인이 필요합니다.' };

  const user = session.user as any;
  try {
    await deleteReply(postId, commentId, replyId, user.role === 'admin' ? '__admin__' : user.id);
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? '대댓글 삭제에 실패했습니다.' };
  }
}