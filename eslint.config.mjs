import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Links and redirects must keep the visitor's language.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message: "Use Link from @/i18n/navigation.",
            },
            {
              name: "next/navigation",
              importNames: ["redirect", "usePathname", "useRouter"],
              message: "Use the version from @/i18n/navigation.",
            },
          ],
        },
      ],
    },
  },
  {
    // Admin is English only and has no locale provider, so it uses Next's
    // own Link and navigation, and must not use the locale-aware versions.
    files: ["app/admin/**", "components/admin/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/i18n/navigation",
              message:
                "Admin is English only: use next/link and next/navigation.",
            },
          ],
          patterns: [
            {
              group: ["next-intl", "next-intl/*"],
              message: "Admin is English only and has no locale provider.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
