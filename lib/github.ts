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
export async function getFile(path: string) {
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    if (Array.isArray(data) || data.type !== 'file') throw new Error('Not a file');
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha };
  } catch (err: any) {
    if (err.status === 404) return null;
    throw err;
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
export async function getAllPosts() {
  const paths = await listFiles('content/posts');
  const posts = await Promise.all(
    paths.map(async (path) => {
      const file = await getFile(path);
      if (!file) return null;
      return JSON.parse(file.content);
    }),
  );
  return posts
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

// lib/github.ts - getUnreadComments 함수 교체
export async function getUnreadComments(userId: string, lastChecked: string) {
  const paths = await listFiles('content/posts');

  // 유저 목록 로드 (이름 → id 매핑용)
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

  await Promise.all(
    paths.map(async (path) => {
      const file = await getFile(path);
      if (!file) return;
      const post = JSON.parse(file.content);

      (post.comments ?? []).forEach((comment: any) => {
        // 1. 내 게시글에 달린 새 댓글 (본인 제외)
        if (
          post.authorId === userId &&
          comment.authorId !== userId &&
          new Date(comment.createdAt) > new Date(lastChecked)
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

        // 2. 내 댓글에 달린 새 답글 (본인 제외)
        if (comment.authorId === userId) {
          (comment.replies ?? []).forEach((reply: any) => {
            if (
              reply.authorId !== userId &&
              new Date(reply.createdAt) > new Date(lastChecked)
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

        // 3. 답글에서 @이름으로 멘션된 경우
        (comment.replies ?? []).forEach((reply: any) => {
          if (reply.authorId === userId) return; // 본인이 쓴 답글은 제외

          const match = reply.content.match(/^@(\S+)/);
          if (!match) return;

          const mentionedName = match[1];
          const mentionedId   = nameToId.get(mentionedName);

          if (
            mentionedId === userId &&
            new Date(reply.createdAt) > new Date(lastChecked)
          ) {
            // 이미 내 댓글에 달린 답글로 추가된 경우 중복 방지
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
    }),
  );

  return unread.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
// lib/github.ts 맨 아래에 추가

export async function getSettings() {
  const file = await getFile('data/settings.json');
  if (!file) return null;
  return JSON.parse(file.content);
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