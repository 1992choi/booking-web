'use client';

import { useState } from 'react';
import { updateReview, deleteReview } from '@/lib/api/reviews';
import { getErrorMessage } from '@/lib/api/axios';
import { formatDate } from '@/lib/utils/format';
import type { Review } from '@/lib/types/review';

export function ReviewCard({
  review,
  isMine,
  onUpdated,
  onDeleted,
}: {
  review: Review;
  isMine: boolean;
  onUpdated: (review: Review) => void;
  onDeleted: (reviewId: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [content, setContent] = useState(review.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateReview(review.id, { content: content.trim() });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError('');
    try {
      await deleteReview(review.id);
      onDeleted(review.id);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-4">
      {editing ? (
        <>
          <label htmlFor={`review-content-${review.id}`} className="sr-only">
            후기 내용
          </label>
          <textarea
            id={`review-content-${review.id}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="text-xs font-semibold text-blue-500 disabled:text-gray-300"
            >
              저장
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setContent(review.content);
                setError('');
              }}
              className="text-xs font-medium text-gray-400"
            >
              취소
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{review.content}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
              {review.updatedAt !== review.createdAt && ' (수정됨)'}
            </span>
            {isMine && (
              <div className="flex items-center gap-2 text-xs">
                {confirmingDelete ? (
                  <>
                    <span className="text-gray-400">삭제할까요?</span>
                    <button onClick={handleDelete} disabled={saving} className="font-semibold text-red-500">
                      삭제
                    </button>
                    <button onClick={() => setConfirmingDelete(false)} className="font-medium text-gray-400">
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditing(true)} className="font-medium text-blue-500">
                      수정
                    </button>
                    <button onClick={() => setConfirmingDelete(true)} className="font-medium text-gray-400">
                      삭제
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}
