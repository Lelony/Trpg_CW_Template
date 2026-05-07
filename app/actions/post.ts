// app/actions/post.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { generatePostId, createFile, getPost, updateFile, deleteFile } from '@/lib/github';
import { PostSchema } from '@/lib/schemas';
import { canEditPost } from '@/lib/permissions';

function parseFormData(formData: FormData) {
  return {
    title:        formData.get('title')     as string,
    content:      formData.get('content')   as string,
    status:       formData.get('status')    as string,
    publishAt:    formData.get('publishAt') as string || undefined,
    tags: (formData.get('tags') as string)
  ?.split(',').map((t) => t.trim().replace(/^#+/, '')).filter(Boolean) ?? [],
    allowedUsers: (formData.get('allowedUsers') as string)
      ?.split(',').map((u) => u.trim()).filter(Boolean) ?? [],
  };
}

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('로그인이 필요합니다.');

  const raw = parseFormData(formData);
  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const id  = generatePostId();
  const now = new Date().toISOString();
  const user = session.user as any;

  const post = {
    id,
    ...parsed.data,
    authorId:   user.id,
    authorName: user.name,
    createdAt:  now,
    updatedAt:  now,
  };

  await createFile(
    `content/posts/${id}.json`,
    JSON.stringify(post, null, 2),
    `feat: add post "${post.title}" by ${user.id}`,
  );

  revalidatePath('/');
  redirect(`/posts/${id}`);
}

export async function updatePost(id: string, sha: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('로그인이 필요합니다.');

  const existing = await getPost(id);
  if (!existing) return { error: '게시글을 찾을 수 없습니다.' };

  const user = session.user as any;
  if (!canEditPost(existing, user)) return { error: '수정 권한이 없습니다.' };

  const raw = parseFormData(formData);
  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const updated = {
    ...existing,
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  await updateFile(
    `content/posts/${id}.json`,
    JSON.stringify(updated, null, 2),
    sha,
    `fix: update post "${updated.title}" by ${user.id}`,
  );

  revalidatePath('/');
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}

export async function deletePost(id: string, sha: string) {
  const session = await auth();
  if (!session?.user) throw new Error('로그인이 필요합니다.');

  const existing = await getPost(id);
  if (!existing) return { error: '게시글을 찾을 수 없습니다.' };

  const user = session.user as any;
  if (!canEditPost(existing, user)) return { error: '삭제 권한이 없습니다.' };

  await deleteFile(
    `content/posts/${id}.json`,
    sha,
    `delete: post "${existing.title}" by ${user.id}`,
  );

  revalidatePath('/');
  redirect('/');
}