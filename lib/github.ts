// lib/github.ts
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

const OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO  = process.env.GITHUB_REPO_NAME!;

// 레이스 컨디션 방지: timestamp + random 조합으로 고유 ID 생성
export function generatePostId(): string {
  const ts  = Date.now();
  const rnd = Math.random().toString(36).slice(2, 6);
  return `${ts}_${rnd}`;
}

// 파일 읽기 (Base64 디코딩 포함)
// lib/github.ts - getFile 함수 교체
export async function getFile(path: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
      if (Array.isArray(data) || data.type !== 'file') throw new Error('Not a file');
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { content, sha: data.sha };
    } catch (err: any) {
      if (err.status === 404) return null; // 파일 없음 → 재시도 불필요
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1))); // 0.5초, 1초 간격으로 재시도
        continue;
      }
      throw err;
    }
  }
}

// 파일 생성 (SHA 없이)
export async function createFile(path: string, content: string, message: string) {
  const encoded = Buffer.from(content, 'utf-8').toString('base64');
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path,
    message,
    content: encoded,
  });
}

// 파일 수정 (SHA 필수 — 낙관적 동시성 제어)
export async function updateFile(
  path: string,
  content: string,
  sha: string,
  message: string,
) {
  const encoded = Buffer.from(content, 'utf-8').toString('base64');
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path,
    message, content: encoded, sha,
  });
}

// 디렉토리 내 파일 목록 조회
export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: dirPath });
    if (!Array.isArray(data)) return [];
    return data
      .filter((f) => f.type === 'file' && f.name.endsWith('.json'))
      .map((f) => f.path);
  } catch {
    return [];
  }
}

// 모든 게시글 로드 (목록 페이지용)
// lib/github.ts - getAllPosts 교체
export async function getAllPosts() {
  const paths = await listFiles('content/posts');

  // 한번에 10개씩만 병렬 처리
  const results: any[] = [];
  for (let i = 0; i < paths.length; i += 10) {
    const chunk = paths.slice(i, i + 10);
    const chunkResults = await Promise.all(
      chunk.map(async (path) => {
        try {
          const file = await getFile(path);
          if (!file) return null;
          return JSON.parse(file.content);
        } catch {
          return null;
        }
      })
    );
    results.push(...chunkResults);
  }

  return results
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 단일 게시글 로드
export async function getPost(id: string) {
  const file = await getFile(`content/posts/${id}.json`);
  if (!file) return null;
  return { ...JSON.parse(file.content), sha: file.sha };
}

// 유저 목록 로드
export async function getUsers() {
  const file = await getFile('data/users.json');
  if (!file) return [];
  return JSON.parse(file.content);
}

// lib/github.ts 맨 아래에 추가
export async function deleteFile(path: string, sha: string, message: string) {
  await octokit.repos.deleteFile({
    owner: OWNER, repo: REPO, path, message, sha,
  });
}

// lib/github.ts 맨 아래에 추가
export async function saveUsers(users: any[]) {
  const file = await getFile('data/users.json');
  await updateFile(
    'data/users.json',
    JSON.stringify(users, null, 2),
    file!.sha,
    'chore: update users.json',
  );
}

// 기존 addComment 함수 교체
export async function addComment(postId: string, comment: {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post = JSON.parse(file.content);
  if (!post.comments) post.comments = [];
  post.comments.push({ ...comment, replies: [] });

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `comment: add comment to "${post.title}" by ${comment.authorId}`,
  );
}

// lib/github.ts deleteComment 함수 수정
export async function deleteComment(postId: string, commentId: string, userId: string) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post = JSON.parse(file.content);
  const comment = post.comments?.find((c: any) => c.id === commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

  // 관리자(__admin__)거나 본인 댓글이면 삭제 가능
  if (userId !== '__admin__' && comment.authorId !== userId) {
    throw new Error('삭제 권한이 없습니다.');
  }

  post.comments = post.comments.filter((c: any) => c.id !== commentId);

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `comment: delete comment from "${post.title}"`,
  );
}

export async function getUnreadComments(userId: string, lastChecked: string) {
  // lastChecked가 너무 오래됐으면 최근 7일로 제한
  const checkFrom = new Date(lastChecked);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const effectiveFrom = checkFrom < sevenDaysAgo ? sevenDaysAgo : checkFrom;

  const paths = await listFiles('content/posts');

  const usersFile = await getFile('data/users.json');
  const users: any[] = usersFile ? JSON.parse(usersFile.content) : [];
  const nameToId = new Map(users.map((u) => [u.name, u.id]));

  const unread: {
    postId: string;
    postTitle: string;
    commentId: string;
    authorName: string;
    content: string;
    createdAt: string;
    type: 'comment' | 'reply' | 'mention';
  }[] = [];

  // 병렬 처리로 속도 개선
  await Promise.all(
    paths.map(async (path) => {
      try {
        const file = await getFile(path);
        if (!file) return;
        const post = JSON.parse(file.content);

        // 댓글이 없으면 스킵
        if (!post.comments?.length) return;

        // 가장 최근 댓글이 effectiveFrom보다 오래됐으면 스킵
        const latestComment = post.comments[post.comments.length - 1];
        if (new Date(latestComment.createdAt) < effectiveFrom) return;

        (post.comments ?? []).forEach((comment: any) => {
          if (
            post.authorId === userId &&
            comment.authorId !== userId &&
            new Date(comment.createdAt) > effectiveFrom
          ) {
            unread.push({
              postId:     post.id,
              postTitle:  post.title,
              commentId:  comment.id,
              authorName: comment.authorName,
              content:    comment.content,
              createdAt:  comment.createdAt,
              type:       'comment',
            });
          }

          if (comment.authorId === userId) {
            (comment.replies ?? []).forEach((reply: any) => {
              if (
                reply.authorId !== userId &&
                new Date(reply.createdAt) > effectiveFrom
              ) {
                unread.push({
                  postId:     post.id,
                  postTitle:  post.title,
                  commentId:  comment.id,
                  authorName: reply.authorName,
                  content:    reply.content,
                  createdAt:  reply.createdAt,
                  type:       'reply',
                });
              }
            });
          }

          (comment.replies ?? []).forEach((reply: any) => {
            if (reply.authorId === userId) return;
            const match = reply.content.match(/^@(\S+)/);
            if (!match) return;
            const mentionedId = nameToId.get(match[1]);
            if (
              mentionedId === userId &&
              new Date(reply.createdAt) > effectiveFrom
            ) {
              const alreadyAdded = unread.some(
                (n) => n.commentId === comment.id && n.createdAt === reply.createdAt
              );
              if (!alreadyAdded) {
                unread.push({
                  postId:     post.id,
                  postTitle:  post.title,
                  commentId:  comment.id,
                  authorName: reply.authorName,
                  content:    reply.content,
                  createdAt:  reply.createdAt,
                  type:       'mention',
                });
              }
            }
          });
        });
      } catch {
        // 개별 파일 오류는 무시
      }
    }),
  );

  return unread.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}


export async function getSettings() {
  try {
    const file = await getFile('data/settings.json');
    if (!file) return null;
    return JSON.parse(file.content);
  } catch {
    return null;
  }
}

export async function saveSettings(settings: any) {
  const file = await getFile('data/settings.json');
  if (!file) throw new Error('settings.json을 찾을 수 없습니다.');
  await updateFile(
    'data/settings.json',
    JSON.stringify(settings, null, 2),
    file.sha,
    'chore: update site settings',
  );
}

// 대댓글 추가 함수 새로 추가
export async function addReply(postId: string, commentId: string, reply: {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post = JSON.parse(file.content);
  const comment = post.comments?.find((c: any) => c.id === commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

  if (!comment.replies) comment.replies = [];
  comment.replies.push(reply);

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `comment: add reply to "${post.title}" by ${reply.authorId}`,
  );
}

// 대댓글 삭제 함수 새로 추가
export async function deleteReply(postId: string, commentId: string, replyId: string, userId: string) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post = JSON.parse(file.content);
  const comment = post.comments?.find((c: any) => c.id === commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

  const reply = comment.replies?.find((r: any) => r.id === replyId);
  if (!reply) throw new Error('대댓글을 찾을 수 없습니다.');
  if (userId !== '__admin__' && reply.authorId !== userId) throw new Error('삭제 권한이 없습니다.');

  comment.replies = comment.replies.filter((r: any) => r.id !== replyId);

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `comment: delete reply from "${post.title}"`,
  );
}

// lib/github.ts 맨 아래에 추가

export async function toggleReaction(postId: string, userId: string, emoji: string) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post = JSON.parse(file.content);
  if (!post.reactions) post.reactions = {};

  // 각 이모지별로 userId 배열 관리
  // { '👍': ['user1', 'user2'], '❤️': ['user3'] }

  // 현재 내가 누른 이모지 찾기
  const currentEmoji = REACTION_EMOJIS.find((e) => post.reactions[e]?.includes(userId));

  // 같은 걸 다시 누르면 취소
  if (currentEmoji === emoji) {
    post.reactions[emoji] = post.reactions[emoji].filter((id: string) => id !== userId);
  } else {
    // 기존 리액션 제거
    if (currentEmoji) {
      post.reactions[currentEmoji] = post.reactions[currentEmoji].filter((id: string) => id !== userId);
    }
    // 새 리액션 추가
    if (!post.reactions[emoji]) post.reactions[emoji] = [];
    post.reactions[emoji].push(userId);
  }

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `reaction: ${userId} reacted ${emoji} to "${post.title}"`,
  );

  return post.reactions;
}

// lib/github.ts 맨 아래에 추가
const REACTION_EMOJIS = ['👍', '❤️', '😮', '😂', '😢', '😡', '🔥', '👀', '🎉', '💀'];

export async function toggleCommentReaction(
  postId: string,
  commentId: string,
  userId: string,
  emoji: string,
  replyId?: string,
) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post = JSON.parse(file.content);
  const comment = post.comments?.find((c: any) => c.id === commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

  // 대댓글 리액션인지 댓글 리액션인지 구분
  const target = replyId
    ? comment.replies?.find((r: any) => r.id === replyId)
    : comment;

  if (!target) throw new Error('대댓글을 찾을 수 없습니다.');
  if (!target.reactions) target.reactions = {};

  const currentEmoji = REACTION_EMOJIS.find((e) => target.reactions[e]?.includes(userId));

  if (currentEmoji === emoji) {
    target.reactions[emoji] = target.reactions[emoji].filter((id: string) => id !== userId);
  } else {
    if (currentEmoji) {
      target.reactions[currentEmoji] = target.reactions[currentEmoji].filter((id: string) => id !== userId);
    }
    if (!target.reactions[emoji]) target.reactions[emoji] = [];
    target.reactions[emoji].push(userId);
  }

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `reaction: ${userId} reacted to comment in "${post.title}"`,
  );

  return target.reactions;
}

// lib/github.ts 맨 아래에 추가

export async function editComment(postId: string, commentId: string, content: string, userId: string) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post = JSON.parse(file.content);
  const comment = post.comments?.find((c: any) => c.id === commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');
  if (comment.authorId !== userId) throw new Error('수정 권한이 없습니다.');

  comment.content   = content;
  comment.updatedAt = new Date().toISOString();

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `comment: edit comment in "${post.title}" by ${userId}`,
  );
}

export async function editReply(postId: string, commentId: string, replyId: string, content: string, userId: string) {
  const file = await getFile(`content/posts/${postId}.json`);
  if (!file) throw new Error('게시글을 찾을 수 없습니다.');

  const post    = JSON.parse(file.content);
  const comment = post.comments?.find((c: any) => c.id === commentId);
  if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

  const reply = comment.replies?.find((r: any) => r.id === replyId);
  if (!reply) throw new Error('답글을 찾을 수 없습니다.');
  if (reply.authorId !== userId) throw new Error('수정 권한이 없습니다.');

  reply.content   = content;
  reply.updatedAt = new Date().toISOString();

  await updateFile(
    `content/posts/${postId}.json`,
    JSON.stringify(post, null, 2),
    file.sha,
    `comment: edit reply in "${post.title}" by ${userId}`,
  );
}

// lib/github.ts 맨 아래에 추가

export async function getBookmarks() {
  const file = await getFile('data/bookmarks.json');
  if (!file) return { bookmarks: {}, sha: '' };
  return { bookmarks: JSON.parse(file.content), sha: file.sha };
}

export async function toggleBookmark(userId: string, postId: string, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const file = await getFile('data/bookmarks.json');
      if (!file) throw new Error('bookmarks.json을 찾을 수 없습니다.');

      const bookmarks = JSON.parse(file.content);
      if (!bookmarks[userId]) bookmarks[userId] = [];

      const isBookmarked = bookmarks[userId].includes(postId);

      if (isBookmarked) {
        bookmarks[userId] = bookmarks[userId].filter((id: string) => id !== postId);
      } else {
        bookmarks[userId].push(postId);
      }

      await updateFile(
        'data/bookmarks.json',
        JSON.stringify(bookmarks, null, 2),
        file.sha,
        `bookmark: ${userId} ${isBookmarked ? 'removed' : 'added'} ${postId}`,
      );

      return !isBookmarked; // 북마크 추가면 true, 제거면 false
    } catch (err: any) {
      // 409 충돌 시 재시도
      if (err.status === 409 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('북마크 처리에 실패했습니다.');
}

// lib/github.ts 맨 아래에 추가

// 인덱스 파일 읽기
export async function getIndex() {
  const file = await getFile('data/index.json');
  if (!file) return { index: [], sha: '' };
  return { index: JSON.parse(file.content), sha: file.sha };
}

// 인덱스 업데이트 (충돌 시 최대 5회 재시도)
export async function updateIndex(
  updater: (index: any[]) => any[],
  retries = 5,
) {
  for (let i = 0; i < retries; i++) {
    try {
      const file = await getFile('data/index.json');
      if (!file) throw new Error('index.json을 찾을 수 없습니다.');

      const index = JSON.parse(file.content);
      const updated = updater(index);

      await updateFile(
        'data/index.json',
        JSON.stringify(updated, null, 2),
        file.sha,
        'chore: update index.json',
      );
      return;
    } catch (err: any) {
      if (err.status === 409 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('인덱스 업데이트에 실패했습니다.');
}

// 인덱스에 게시글 추가
export async function addToIndex(post: any) {
  await updateIndex((index) => {
    const entry = {
      id:           post.id,
      title:        post.title,
      authorId:     post.authorId,
      authorName:   post.authorName,
      status:       post.status,
      tags:         post.tags ?? [],
      allowedUsers: post.allowedUsers ?? [],
      publishAt:    post.publishAt ?? null,
      createdAt:    post.createdAt,
      updatedAt:    post.updatedAt,
      commentCount: 0,
    };
    return [entry, ...index];
  });
}

// 인덱스에서 게시글 수정
export async function updateIndexEntry(postId: string, updates: Partial<any>) {
  await updateIndex((index) =>
    index.map((entry) =>
      entry.id === postId ? { ...entry, ...updates } : entry
    )
  );
}

// 인덱스에서 게시글 삭제
export async function removeFromIndex(postId: string) {
  await updateIndex((index) =>
    index.filter((entry) => entry.id !== postId)
  );
}

// 인덱스에서 댓글 수 업데이트
export async function updateCommentCount(postId: string, delta: number) {
  await updateIndex((index) =>
    index.map((entry) =>
      entry.id === postId
        ? { ...entry, commentCount: Math.max(0, (entry.commentCount ?? 0) + delta) }
        : entry
    )
  );
}

// 인덱스 기반 게시글 목록 조회 (페이지네이션)
export async function getPostsFromIndex(page: number, limit = 30) {
  const { index } = await getIndex();
  const sorted = index.sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const total = sorted.length;
  const totalPages = Math.ceil(total / limit);
  const pagePosts = sorted.slice((page - 1) * limit, page * limit);

  return { posts: pagePosts, total, totalPages };
}