"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowClockwise, ArrowSquareOut, Copy } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Notice } from "@/components/admin/Notice";
import { useToast } from "@/components/admin/Toast";
import type { Media } from "@/lib/admin/media";
import type { SocialChannel } from "@/lib/admin/postDraft";
import { channelNames, channelOrder, whenShort } from "@/lib/admin/posts";
import {
  canMarkPosted,
  canRetry,
  failureReason,
  isSocial,
  needsConnection,
} from "@/lib/admin/postWorkflow";
import type { components } from "@/lib/api/schema";
import { ChannelBadge } from "../../_components/ChannelBadge";
import { reloadPost, retryChannel } from "../actions";
import { CopyAndOpen } from "./CopyAndOpen";
import { sectionTitle } from "./WebsiteFields";

type Post = components["schemas"]["Post"];
type Publication = Post["publications"][number];

// While a channel is still going out, look again every few seconds for a
// couple of minutes; after that "Check again" is there.
const POLL_MS = 5000;
const POLL_TRIES = 24;

const waiting = (p: Publication) =>
  p.status === "pending" || p.status === "publishing";

function liveLink(post: Post, p: Publication) {
  if (p.permalink) return p.permalink;
  const slug = post.versions.website?.slug;
  return p.channel === "website" && p.status === "published" && slug
    ? `/stories/${slug}`
    : undefined;
}

// Each channel's publishing (#152): its status, the live post, why it
// failed and what to do next: Retry, or Copy & open and mark it posted.
export function Channels({
  post,
  media,
  canConnect,
  onChange,
}: {
  post: Post;
  media: Record<string, Media>;
  // The site administrator, who manages the platform connections.
  canConnect: boolean;
  onChange: (post: Post) => void;
}) {
  const [copying, setCopying] = useState<SocialChannel>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const tries = useRef(0);
  const toast = useToast();

  const publications = [...post.publications].sort(
    (a, b) => channelOrder.indexOf(a.channel) - channelOrder.indexOf(b.channel),
  );
  const anyWaiting = publications.some(waiting);

  function check() {
    startTransition(async () => {
      try {
        onChange(await reloadPost(post.id));
      } catch {
        // A missed look is not worth a message; the next one or the
        // button tries again.
      }
    });
  }

  useEffect(() => {
    if (!anyWaiting || tries.current >= POLL_TRIES) return;
    const timer = setTimeout(() => {
      tries.current += 1;
      check();
    }, POLL_MS);
    return () => clearTimeout(timer);
    // The post's version changes with every update, which re-arms the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyWaiting, post.version]);

  function retry(channel: SocialChannel) {
    startTransition(async () => {
      const outcome = await retryChannel(post.id, channel);
      if (outcome.ok) {
        tries.current = 0;
        onChange(outcome.data);
        setError(undefined);
        toast(`Trying ${channelNames[channel]} again`);
      } else setError(outcome.message);
    });
  }

  return (
    <Card as="section">
      <h2 className={sectionTitle}>Channels</h2>
      <ul className="flex flex-col">
        {publications.map((p) => {
          const href = liveLink(post, p);
          const social = isSocial(p.channel) ? p.channel : undefined;
          return (
            <li
              key={p.channel}
              className="flex flex-col items-start gap-2 border-b border-divider py-4 first:pt-0 last:border-0 last:pb-0"
            >
              <ChannelBadge channel={p.channel} status={p.status} />
              {p.publishedAt && (
                <p className="text-[0.85rem] text-muted">
                  {p.status === "manual" ? "Posted by hand" : "Published"} on{" "}
                  {whenShort(p.publishedAt)}
                </p>
              )}
              {p.status === "failed" && (
                <p className="text-[0.88rem] leading-[1.6] text-action">
                  {failureReason(p.error)}
                  {canConnect && needsConnection(p.error) && (
                    <>
                      {" "}
                      <Link
                        href="/admin/settings/connections"
                        className="font-semibold underline underline-offset-4 transition-colors duration-150 hover:text-ink motion-reduce:transition-none"
                      >
                        Open Connections
                      </Link>
                    </>
                  )}
                </p>
              )}
              {waiting(p) && (
                <p className="text-[0.88rem] text-muted">
                  Waiting for {channelNames[p.channel]}…
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 text-[0.9rem] font-semibold text-ink transition-colors duration-150 hover:text-indigo motion-reduce:transition-none"
                  >
                    <span className="border-b border-current pb-px">
                      View the post
                    </span>
                    <ArrowSquareOut aria-hidden="true" size={16} />
                    <span className="sr-only">
                      {" "}
                      on {channelNames[p.channel]} (opens in a new tab)
                    </span>
                  </a>
                )}
                {social && canRetry(post.status, p) && (
                  <Button
                    variant="secondary"
                    disabled={pending}
                    icon={<ArrowClockwise aria-hidden="true" size={18} />}
                    onClick={() => retry(social)}
                  >
                    Retry
                  </Button>
                )}
                {social && canMarkPosted(post.status, p) && (
                  <Button
                    variant={p.status === "manual" ? "quiet" : "secondary"}
                    icon={
                      p.status === "manual" ? undefined : (
                        <Copy aria-hidden="true" size={18} />
                      )
                    }
                    onClick={() => setCopying(social)}
                  >
                    {p.status === "manual" ? "Change the link" : "Copy & open"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {anyWaiting && (
        <div className="mt-4">
          <Button variant="quiet" busy={pending} onClick={check}>
            Check again
          </Button>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <CopyAndOpen
        post={post}
        channel={copying}
        media={media}
        onClose={() => setCopying(undefined)}
        onChange={onChange}
      />
    </Card>
  );
}
