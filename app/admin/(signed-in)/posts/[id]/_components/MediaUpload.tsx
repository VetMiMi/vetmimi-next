"use client";

import { useEffect, useRef, useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { Button, buttonClass } from "@/components/admin/Button";
import { FieldError } from "@/components/admin/Field";
import { Notice } from "@/components/admin/Notice";
import {
  ACCEPTED_TYPES,
  fileProblem,
  megabytes,
  uploadFailure,
  type Media,
} from "@/lib/admin/media";
import { AltFields, altErrors, describe } from "./AltFields";

type Result = { ok: true; media: Media } | { ok: false; code: string };

// Sent with XMLHttpRequest, not fetch, because only it reports upload
// progress. The route handler forwards the file with the session cookie.
function send(
  form: FormData,
  onProgress: (percent: number) => void,
): { done: Promise<Result>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const done = new Promise<Result>((resolve) => {
    xhr.open("POST", "/admin/media/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const body = xhr.response as { id?: string; code?: string } | null;
      if (xhr.status === 201 && body?.id)
        return resolve({ ok: true, media: body as Media });
      // A session that ended is sent to sign-in by the proxy.
      const signedOut = xhr.responseURL.includes("/admin/sign-in");
      resolve({
        ok: false,
        code: signedOut ? "unauthenticated" : (body?.code ?? ""),
      });
    };
    xhr.onerror = () => resolve({ ok: false, code: "" });
    xhr.send(form);
  });
  return { done, abort: () => xhr.abort() };
}

// A new image for the library (#151): chosen, described in both
// languages, then uploaded with progress and attached.
export function MediaUpload({
  onUploaded,
}: {
  onUploaded: (media: Media) => void;
}) {
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [problem, setProblem] = useState<string>();
  const [description, setDescription] = useState(describe());
  const [tried, setTried] = useState(false);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const abort = useRef<() => void>(undefined);

  useEffect(() => () => abort.current?.(), []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    const why = fileProblem(chosen);
    setProblem(why);
    setError(undefined);
    setFile(why ? undefined : chosen);
    setPreview(why ? undefined : URL.createObjectURL(chosen));
  }

  async function upload() {
    setTried(true);
    if (!file) {
      setProblem(problem ?? "Choose an image to upload.");
      return;
    }
    if (Object.keys(altErrors(description)).length > 0) return;
    const form = new FormData();
    form.append("altEn", description.en.trim());
    form.append("altMy", description.my.trim());
    if (description.credit.trim())
      form.append("credit", description.credit.trim());
    form.append("file", file);
    setError(undefined);
    setProgress(0);
    const request = send(form, setProgress);
    abort.current = request.abort;
    const result = await request.done;
    abort.current = undefined;
    setProgress(undefined);
    if (result.ok) onUploaded(result.media);
    else setError(uploadFailure(result.code));
  }

  const uploading = progress !== undefined;

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <input
          id="media-file"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={choose}
          disabled={uploading}
          aria-describedby="media-file-help media-file-error"
          className="peer sr-only"
        />
        <label
          htmlFor="media-file"
          className={buttonClass(
            "secondary",
            "control",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-coral peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          )}
        >
          <UploadSimple aria-hidden="true" size={18} />
          {file ? "Choose a different image" : "Choose an image"}
        </label>
        <p
          id="media-file-help"
          className="mt-2 text-[0.88rem] leading-[1.6] text-muted"
        >
          JPEG, PNG or WebP, up to 20 MB. Camera and location details are
          removed when it is stored.
        </p>
        <FieldError id="media-file-error" error={problem} />
      </div>

      {file && preview && (
        <div className="flex items-center gap-3">
          {/* A local blob: preview, which next/image cannot size. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="size-20 shrink-0 rounded-small bg-paper object-cover"
          />
          <p className="min-w-0 text-[0.88rem] leading-[1.5] break-words">
            <span className="font-semibold">{file.name}</span>
            <br />
            <span className="text-muted">{megabytes(file.size)}</span>
          </p>
        </div>
      )}

      <fieldset disabled={uploading} className="m-0 min-w-0 border-0 p-0">
        <AltFields
          value={description}
          errors={tried ? altErrors(description) : {}}
          onChange={setDescription}
        />
      </fieldset>

      {uploading && (
        <div>
          <p className="mb-2 text-[0.88rem] text-muted" aria-live="polite">
            Uploading… {progress}%
          </p>
          <progress
            aria-label="Upload progress"
            max={100}
            value={progress}
            className="block h-2 w-full appearance-none overflow-hidden rounded-pill bg-paper [&::-moz-progress-bar]:bg-indigo [&::-webkit-progress-bar]:bg-paper [&::-webkit-progress-value]:bg-indigo"
          />
        </div>
      )}

      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <Button size="page" busy={uploading} onClick={upload}>
          {uploading ? "Uploading…" : "Upload and attach"}
        </Button>
      </div>
    </div>
  );
}
