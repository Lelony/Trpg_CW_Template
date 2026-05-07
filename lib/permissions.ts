// lib/permissions.ts
export type Post = {
  id: string;
  status: 'private' | 'public' | 'timed' | 'selective';
  publishAt?: string;
  authorId: string;
  allowedUsers?: string[];
  [key: string]: any;
};

export type SessionUser = {
  id: string;
  role: 'admin' | 'moderator' | 'user';
} | null;

export function canViewContent(post: Post, user: SessionUser): boolean {
  // 관리자, 중재자는 모두 볼 수 있음
  if (user?.role === 'admin' || user?.role === 'moderator') return true;

  // 본인 글은 항상 볼 수 있음
  if (user && user.id === post.authorId) return true;

  // public 상태
  if (post.status === 'public') return true;

  // timed 상태 — 공개 시각이 지났으면 공개
  if (post.status === 'timed' && post.publishAt) {
    return new Date() >= new Date(post.publishAt);
  }

  // selective 상태 — 허용된 유저 목록에 있으면 공개
  if (post.status === 'selective' && user) {
    return post.allowedUsers?.includes(user.id) ?? false;
  }

  return false;
}

export function canEditPost(post: Post, user: SessionUser): boolean {
  if (!user) return false;
  return user.id === post.authorId;
}