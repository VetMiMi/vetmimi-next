import type { routing } from "@/i18n/routing";
import type common from "./messages/en/common.json";
import type home from "./messages/en/home.json";
import type about from "./messages/en/about.json";
import type portfolio from "./messages/en/portfolio.json";
import type artOfWellness from "./messages/en/artOfWellness.json";
import type services from "./messages/en/services.json";
import type stories from "./messages/en/stories.json";
import type contact from "./messages/en/contact.json";
import type book from "./messages/en/book.json";
import type manage from "./messages/en/manage.json";
import type session from "./messages/en/session.json";
import type legal from "./messages/en/legal.json";

// English is the source of truth: a key used in code but missing from the
// English files is a type error.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: {
      common: typeof common;
      home: typeof home;
      about: typeof about;
      portfolio: typeof portfolio;
      artOfWellness: typeof artOfWellness;
      services: typeof services;
      stories: typeof stories;
      contact: typeof contact;
      book: typeof book;
      manage: typeof manage;
      session: typeof session;
      legal: typeof legal;
    };
  }
}
