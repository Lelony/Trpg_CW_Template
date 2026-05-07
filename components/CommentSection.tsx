// components/CommentSection.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import { createComment, createReply, removeComment, removeReply } from '@/app/actions/comment';

const inputStyle = {
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '14px',
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
  resize: 'none' as const,
  lineHeight: 1.7,
  fontFamily: 'var(--font-body)',
};

function ReplyForm({ postId, commentId, onClose, replyTo }: {
  postId: string;
  commentId: string;
  onClose: () => void;
  replyTo?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // replyTo가 있으면 내용 앞에 @이름 자동 추가
    if (replyTo) {
      const content = fd.get('content') as string;
      fd.set('content', `@${replyTo} ${content}`);
    }
    setError(null);
    startTransition(async () => {
      const res = await createReply(postId, commentId, fd);
      if (res?.error) setError(res.error);
      else { formRef.current?.reset(); onClose(); }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {replyTo && (
        <p style={{ fontSize: '12px', color: 'var(--accent)', margin: 0 }}>
          @{replyTo} 에게 답글
        </p>
      )}
      {error && (
        <p style={{ fontSize: '12px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '8px 10px' }}>
          {error}
        </p>
      )}
      <textarea
        name="content"
        required
        rows={2}
        placeholder="답글을 입력하세요..."
        style={{ ...inputStyle, fontSize: '13px' }}
      />
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ fontSize: '12px', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer' }}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          style={{ fontSize: '12px', padding: '6px 12px', backgroundColor: 'var(--accent)', color: 'var(--accent-text)', fontWeight: '600', borderRadius: '6px', border: 'none', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}
        >
          {pending ? '등록 중...' : '답글 등록'}
        </button>
      </div>
    </form>
  );
}

function ReplyItem({ reply, postId, commentId, currentUser, onReply }: {
  reply: any;
  postId: string;
  commentId: string;
  currentUser: any;
  onReply: (authorName: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('답글을 삭제하시겠습니까?')) return;
    startTransition(async () => {
      await removeReply(postId, commentId, reply.id);
    });
  };

  // @이름 부분을 파란색으로 표시
  const renderContent = (content: string) => {
    const match = content.match(/^(@\S+)\s([\s\S]*)$/);
    if (match) {
      return (
        <>
          <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{match[1]}</span>
          {' '}{match[2]}
        </>
      );
    }
    return content;
  };

  return (
    <div style={{
      marginLeft: '20px',
      paddingLeft: '14px',
      borderLeft: '2px solid var(--border)',
      marginTop: '8px',
    }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-title)' }}>
              {reply.authorName}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {new Date(reply.createdAt).toLocaleString('ko-KR')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {currentUser && (
              <button
                onClick={() => onReply(reply.authorName)}
                style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                답글
              </button>
            )}
            {(currentUser?.id === reply.authorId || currentUser?.role === 'admin') && (
              <button
                onClick={handleDelete}
                disabled={pending}
                style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: pending ? 0.5 : 1 }}
              >
                삭제
              </button>
            )}
          </div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {renderContent(reply.content)}
        </p>
      </div>
    </div>
  );
}

function CommentItem({ comment, postId, currentUser }: {
  comment: any;
  postId: string;
  currentUser: any;
}) {
  // replyTo: null이면 폼 닫힘, 문자열이면 해당 이름에게 답글
  const [replyTo,     setReplyTo]     = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState(true);
  const [pending, startTransition]    = useTransition();

  const handleDelete = () => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    startTransition(async () => {
      await removeComment(postId, comment.id);
    });
  };

  // 댓글에 답글 → replyTo = undefined (누구에게 지정 안 함)
  // 답글에 답글 → replyTo = 답글 작성자 이름
  const openReplyForm = (authorName?: string) => {
    setReplyTo(authorName ?? '');
    setShowReplies(true);
  };

  const replyCount = comment.replies?.length ?? 0;

  return (
    <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px' }}>
      {/* 댓글 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-title)' }}>
            {comment.authorName}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {new Date(comment.createdAt).toLocaleString('ko-KR')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {currentUser && (
            <button
              onClick={() => openReplyForm()}
              style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {replyTo !== null ? '취소' : '답글'}
            </button>
          )}
          {(currentUser?.id === comment.authorId || currentUser?.role === 'admin') && (
            <button
              onClick={handleDelete}
              disabled={pending}
              style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: pending ? 0.5 : 1 }}
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* 댓글 내용 */}
      <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
        {comment.content}
      </p>

      {/* 답글 작성 폼 */}
      {replyTo !== null && currentUser && (
        <ReplyForm
          postId={postId}
          commentId={comment.id}
          replyTo={replyTo || undefined}
          onClose={() => setReplyTo(null)}
        />
      )}

      {/* 답글 목록 */}
      {replyCount > 0 && (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => setShowReplies((v) => !v)}
            style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '4px' }}
          >
            {showReplies ? `▲ 답글 ${replyCount}개 숨기기` : `▼ 답글 ${replyCount}개 보기`}
          </button>
          {showReplies && (
            <div>
              {comment.replies.map((reply: any) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  postId={postId}
                  commentId={comment.id}
                  currentUser={currentUser}
                  onReply={(authorName) => openReplyForm(authorName)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, comments, currentUser }: {
  postId: string;
  comments: any[];
  currentUser: { id: string; name: string; role: string } | null;
}) {
  const [error,   setError]   = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await createComment(postId, fd);
      if (res?.error) setError(res.error);
      else formRef.current?.reset();
    });
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px', fontFamily: 'var(--font-title)', letterSpacing: 'var(--letter-spacing)' }}>
        댓글 {totalCount > 0 && <span style={{ color: 'var(--accent)', fontSize: '14px' }}>{totalCount}</span>}
      </h3>

      {/* 댓글 목록 */}
      {comments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          아직 댓글이 없습니다.
        </p>
      )}

      {/* 댓글 작성 */}
      {currentUser ? (
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {error && (
            <p style={{ fontSize: '13px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '10px 12px' }}>
              {error}
            </p>
          )}
          <textarea
            name="content"
            required
            rows={3}
            placeholder="댓글을 입력하세요..."
            style={inputStyle}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-text)',
                fontWeight: '600',
                fontSize: '13px',
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.6 : 1,
                fontFamily: 'var(--font-body)',
              }}
            >
              {pending ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <a href="/login" style={{ color: 'var(--accent)' }}>로그인</a> 후 댓글을 작성할 수 있습니다.
        </p>
      )}
    </div>
  );
}