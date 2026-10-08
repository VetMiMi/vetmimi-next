import { Input } from "@/components/admin/Input";

export type Description = { en: string; my: string; credit: string };

export const describe = (alt?: { en?: string; my?: string }, credit = "") => ({
  en: alt?.en ?? "",
  my: alt?.my ?? "",
  credit,
});

// What a description still needs before the image may be attached.
export function altErrors({ en, my }: Description) {
  return {
    ...(!en.trim() && { en: "Describe the image in English." }),
    ...(!my.trim() && { my: "Describe the image in Burmese." }),
  } as Partial<Record<"en" | "my", string>>;
}

// Alt text in both languages, required, and an optional credit: the
// website is bilingual and every post's images are read aloud to someone.
export function AltFields({
  value,
  errors,
  onChange,
}: {
  value: Description;
  errors: Partial<Record<"en" | "my", string>>;
  onChange: (value: Description) => void;
}) {
  return (
    <div className="flex flex-col gap-[18px]">
      <Input
        label="Alt text in English"
        name="media.alt.en"
        required
        maxLength={300}
        help="What the image shows, for people who cannot see it."
        value={value.en}
        onChange={(event) => onChange({ ...value, en: event.target.value })}
        error={errors.en}
      />
      <Input
        label="Alt text in Burmese"
        name="media.alt.my"
        lang="my"
        required
        maxLength={300}
        value={value.my}
        onChange={(event) => onChange({ ...value, my: event.target.value })}
        error={errors.my}
      />
      <Input
        label="Credit"
        name="media.credit"
        maxLength={300}
        help="Who made the image or artwork, if they should be named."
        value={value.credit}
        onChange={(event) => onChange({ ...value, credit: event.target.value })}
      />
    </div>
  );
}
