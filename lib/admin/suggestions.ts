// The post editor's "Suggest versions" (#153): the AI assistant's channel
// suggestions turned into the editor's text, and its refusals into words.
// Pure, so node:test covers it.
import type { components } from "../api/schema.ts";
import type { SocialChannel } from "./postDraft.ts";

export type Suggestions = components["schemas"]["PostSuggestions"];
export type Language = components["schemas"]["SuggestionRequest"]["language"];

const CHANNELS: SocialChannel[] = ["facebook", "instagram", "linkedin"];

// Instagram's caption comes back without its hashtags; the editor keeps
// them at the end of the caption, as Instagram shows them.
export function suggestedTexts(
  suggestions: Suggestions,
): Partial<Record<SocialChannel, string>> {
  const texts: Partial<Record<SocialChannel, string>> = {};
  for (const channel of CHANNELS) {
    const suggestion = suggestions[channel];
    if (!suggestion) continue;
    if ("caption" in suggestion) {
      const tags = suggestion.hashtags
        .map((tag) => tag.trim().replace(/^#*/, "#"))
        .filter((tag) => tag.length > 1)
        .join(" ");
      texts[channel] = tags
        ? `${suggestion.caption.trimEnd()}\n\n${tags}`
        : suggestion.caption;
    } else {
      texts[channel] = suggestion.text;
    }
  }
  return texts;
}

// What a refusal means for Daw Mi; her text is never touched by one.
export function suggestionFailure(
  status: number,
  code: string,
  retryAfterSeconds?: number,
): string {
  if (code === "rate_limited" || status === 429) {
    const minutes =
      retryAfterSeconds === undefined
        ? undefined
        : Math.max(1, Math.ceil(retryAfterSeconds / 60));
    return `You have asked for 20 suggestions in the last hour, the most allowed. Try again ${minutes ? `in about ${minutes} minute${minutes === 1 ? "" : "s"}` : "later"}.`;
  }
  if (code === "action_not_allowed")
    return "Write and save the website article first: suggestions are written from it.";
  if (code === "ai_failed")
    return "The assistant did not come back with usable suggestions. Your text is unchanged. Try again.";
  if (code === "feature_unavailable")
    return "Suggestions are switched off on the server. Your text is unchanged.";
  if (status === 403)
    return "Your account cannot ask for suggestions. If you need to, ask the site administrator.";
  return "Suggestions could not be made just now. Your text is unchanged. Try again in a few minutes.";
}
