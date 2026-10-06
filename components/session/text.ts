import type session from "@/messages/en/session.json";

// The words the shared call components show, passed in as props: the
// visitor's page takes them from its messages (en and my), the admin's
// call view writes Daw Mi's in English (#83).
export type CheckText = Omit<
  (typeof session)["check"],
  "title" | "when" | "intro"
>;
export type StageText = Omit<(typeof session)["stage"], "inSession">;
