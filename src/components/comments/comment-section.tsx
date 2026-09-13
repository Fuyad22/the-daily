import Link from "next/link";
import { getApprovedCommentsForArticle } from "@/lib/comments/data";
import { getCurrentUser } from "@/lib/auth/dal";
import { CommentForm } from "./comment-form";
import { ReplyToggle } from "./reply-toggle";

type CommentWithAuthor = Awaited<ReturnType<typeof getApprovedCommentsForArticle>>[number];

export async function CommentSection({ articleId }: { articleId: string }) {
  const [comments, user] = await Promise.all([
    getApprovedCommentsForArticle(articleId),
    getCurrentUser(),
  ]);

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = new Map<string, CommentWithAuthor[]>();
  for (const comment of comments) {
    if (comment.parentId) {
      const list = repliesByParent.get(comment.parentId) ?? [];
      list.push(comment);
      repliesByParent.set(comment.parentId, list);
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-2xl border-t border-line px-6 pt-8">
      <h2 className="mb-6 font-display text-xl font-semibold text-ink">
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {user ? (
        <CommentForm articleId={articleId} />
      ) : (
        <p className="mb-6 text-sm text-muted">
          <Link href="/login" className="font-semibold text-accent">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-6">
        {topLevel.map((comment) => (
          <li key={comment.id}>
            <CommentItem comment={comment} />
            {user && <ReplyToggle articleId={articleId} parentId={comment.id} />}
            {(repliesByParent.get(comment.id) ?? []).length > 0 && (
              <ul className="mt-4 ml-8 flex flex-col gap-4 border-l border-line pl-4">
                {repliesByParent.get(comment.id)!.map((reply) => (
                  <li key={reply.id}>
                    <CommentItem comment={reply} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommentItem({ comment }: { comment: CommentWithAuthor }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm">
        <span className="font-semibold text-ink">{comment.author.name}</span>
        <span className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-[15px] text-ink">{comment.body}</p>
    </div>
  );
}
