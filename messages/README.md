# Site text and Burmese translation

Every piece of visible text lives here, one file per area of the site:
`messages/en/<area>.json` (English, the source) and `messages/my/<area>.json`
(Burmese). Both files must have the same keys; `pnpm i18n:check` verifies it.

The Burmese text is a **draft** until Daw Mi (or another native speaker)
has reviewed it. Nothing goes live on the real site before that review.

## Rules for Burmese

- **Unicode only**, never Zawgyi. Convert any Zawgyi source first.
- **Register.** Marketing pages use warm, polite modern Burmese, the way a
  kind practitioner speaks to a client (…ပါတယ်, …ပါ, …နိုင်ပါတယ်). Legal pages
  (Privacy, Disclaimer, Booking policy) use formal written Burmese
  (…သည်, …၏, …ပါသည်).
- Address the reader politely and gently. Avoid words that sound clinical,
  pressuring or like a diagnosis.
- **Digits.** Use Western digits (0–9) for prices, phone numbers, times, dates
  and years, so they match the English page.
- **Keep in English:** VetMiMi, The Art of Wellness, NORTH Foundation,
  Royal North Shore Hospital, CECAT, Human Experience Week, ANZACATA, Medicare,
  email addresses, URLs, and the titles of artworks and essays (add a Burmese
  gloss in brackets only when it helps).
- `[To confirm]` placeholders become `[အတည်ပြုရန်]`.
- Keep `{placeholders}` and rich-text tags such as `<link>…</link>` or `<br></br>`
  exactly as they are in English.

## Glossary

Use these terms every time, so the site reads as one voice.

| English | Burmese |
| --- | --- |
| Daw Mi | ဒေါ်မိ |
| art therapy | အနုပညာကုထုံး |
| art therapist | အနုပညာကုထုံး ပညာရှင် |
| art psychotherapy | အနုပညာ စိတ်ကုထုံး |
| certified art psychotherapist | အသိအမှတ်ပြု အနုပညာ စိတ်ကုထုံး ပညာရှင် |
| co-founder | ပူးတွဲတည်ထောင်သူ |
| mental health | စိတ်ကျန်းမာရေး |
| mental health nurse | စိတ်ကျန်းမာရေး သူနာပြု |
| wellbeing | ကိုယ်စိတ်ကျန်းမာချမ်းသာမှု |
| session | ဆက်ရှင် |
| individual session | တစ်ဦးချင်း ဆက်ရှင် |
| group session | အုပ်စုလိုက် ဆက်ရှင် |
| workshop | အလုပ်ရုံဆွေးနွေးပွဲ |
| free consultation | အခမဲ့ တိုင်ပင်ဆွေးနွေးမှု |
| book / booking | ချိန်းဆိုရန် / ချိန်းဆိုမှု |
| appointment | ချိန်းဆိုမှု |
| enquiry | စုံစမ်းမေးမြန်းမှု |
| artwork | အနုပညာလက်ရာ |
| portfolio | လက်ရာများ |
| stories | ဇာတ်လမ်းများ |
| insights | အတွေးအမြင်များ |
| Stories & Insights | ဇာတ်လမ်းနှင့် အတွေးအမြင်များ (menu: ဆောင်းပါးများ) |
| reflection | ပြန်လည်ဆင်ခြင်မှု |
| creativity | ဖန်တီးမှု |
| trauma | စိတ်ဒဏ်ရာ |
| self-compassion | မိမိကိုယ်ကို ကရုဏာထားခြင်း |
| privacy policy | ကိုယ်ရေးအချက်အလက် မူဝါဒ |
| disclaimer | တာဝန်ကန့်သတ်ချက် |
| cancellation | ပယ်ဖျက်ခြင်း |
| Contact | ဆက်သွယ်ရန် |
| About | အကြောင်း |
| Services | ဝန်ဆောင်မှုများ |

## Open questions for Daw Mi

- Which Burmese name and title does she use publicly? Her profile uses
  မိမိ အီရယ်; the site uses ဒေါ်မိ for "Daw Mi" until she confirms.
- Are the glossary terms the ones she uses with Burmese clients?
