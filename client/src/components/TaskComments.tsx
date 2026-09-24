import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { commentService } from "../services/commentService";
import type { Comment, User } from "../types/models";
import { canManageComment } from "../utils/permissions";

interface TaskCommentsProps {
  taskId: string;
  users: User[];
  commentCount: number;
}

const inputClassName =
  "rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100";
const primaryButtonClassName =
  "rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50";

export const TaskComments = ({
  taskId,
  users,
  commentCount,
}: TaskCommentsProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [displayedCount, setDisplayedCount] = useState(commentCount);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!hasLoaded) {
      setDisplayedCount(commentCount);
    }
  }, [commentCount, hasLoaded]);

  const loadComments = async () => {
    if (hasLoaded || loading) {
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const nextComments = await commentService.list(taskId);
      setComments(nextComments);
      setDisplayedCount(nextComments.length);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load comments",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    if (nextExpanded) {
      void loadComments();
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    if (!newContent.trim()) {
      setCreateError("Comment is required.");
      return;
    }

    setCreating(true);

    try {
      const created = await commentService.create(taskId, {
        content: newContent,
      });
      setComments((current) => [created, ...current]);
      setDisplayedCount((current) => current + 1);
      setNewContent("");
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Unable to add comment",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
    setActionError(null);
  };

  const handleSave = async (commentId: string) => {
    setActionError(null);

    if (!editingContent.trim()) {
      setActionError("Comment is required.");
      return;
    }

    setSavingCommentId(commentId);

    try {
      const updated = await commentService.update(taskId, commentId, {
        content: editingContent,
      });
      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId ? updated : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to update comment",
      );
    } finally {
      setSavingCommentId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    setActionError(null);
    setDeletingCommentId(commentId);

    try {
      await commentService.delete(taskId, commentId);
      setComments((current) =>
        current.filter((comment) => comment._id !== commentId),
      );
      setDisplayedCount((current) => Math.max(0, current - 1));

      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingContent("");
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete comment",
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <>
      <button
        className={primaryButtonClassName}
        onClick={handleToggle}
        type="button"
      >
        {isExpanded ? "Hide Comments" : `Show Comments (${displayedCount})`}
      </button>

      {isExpanded ? (
        <div className="mt-4 basis-full space-y-4 rounded-2xl border border-slate-200 p-4">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => void handleCreate(event)}
          >
            <input
              className={inputClassName}
              disabled={creating}
              onChange={(event) => setNewContent(event.target.value)}
              placeholder="Add a comment"
              value={newContent}
            />
            {createError ? (
              <p className="text-sm text-danger">{createError}</p>
            ) : null}
            <div>
              <button
                className={primaryButtonClassName}
                disabled={creating}
                type="submit"
              >
                {creating ? "Adding..." : "Add comment"}
              </button>
            </div>
          </form>

          {loading ? (
            <p className="text-sm text-slate-500">Loading comments...</p>
          ) : null}
          {loadError ? (
            <p className="text-sm text-danger">{loadError}</p>
          ) : null}
          {actionError ? (
            <p className="text-sm text-danger">{actionError}</p>
          ) : null}

          {!loading && !loadError ? (
            comments.length ? (
              <ul className="space-y-3">
                {comments.map((comment) => {
                  const author = users.find(
                    (candidate) => candidate._id === comment.authorId,
                  );
                  const authorName = author
                    ? `${author.firstName} ${author.lastName}`
                    : "Unknown user";
                  const isEditing = editingCommentId === comment._id;
                  const canManage = canManageComment(user, comment);

                  return (
                    <li
                      className="rounded-2xl bg-slate-50 p-4"
                      key={comment._id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink">
                          {authorName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          {canManage ? (
                            <>
                              <button
                                className="font-medium text-ink hover:underline disabled:opacity-50"
                                disabled={savingCommentId === comment._id}
                                onClick={() => handleEdit(comment)}
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="font-medium text-danger hover:underline disabled:opacity-50"
                                disabled={deletingCommentId === comment._id}
                                onClick={() => void handleDelete(comment._id)}
                                type="button"
                              >
                                {deletingCommentId === comment._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="mt-3 flex flex-col gap-3">
                          <input
                            className={inputClassName}
                            onChange={(event) =>
                              setEditingContent(event.target.value)
                            }
                            value={editingContent}
                          />
                          <div>
                            <button
                              className={primaryButtonClassName}
                              disabled={savingCommentId === comment._id}
                              onClick={() => void handleSave(comment._id)}
                              type="button"
                            >
                              {savingCommentId === comment._id
                                ? "Saving..."
                                : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                          {comment.content}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No comments yet.</p>
            )
          ) : null}
        </div>
      ) : null}
    </>
  );
};
