// The panel's own texts. Home Assistant's translations cover the config flow
// in custom_components/ihcviewer/translations, but a custom panel draws its own
// interface and has to carry its own strings.
//
// Everything is bundled rather than fetched: all eight languages together are
// a few kilobytes, and a fetch would mean the panel drawing itself in English
// first and changing language a moment later.

import { da } from "./da";
import { en } from "./en";
import { et } from "./et";
import { fi } from "./fi";
import { lt } from "./lt";
import { lv } from "./lv";
import { nb } from "./nb";
import { sv } from "./sv";

const LANGUAGES: { [code: string]: { [key: string]: string } } = {
  da, en, et, fi, lt, lv, nb, sv,
};

// The languages around the ihc controller's own market, plus English. Norwegian
// Nynorsk reads Bokmaal rather than English, which is the lesser of the two.
const ALIAS: { [code: string]: string } = { nn: "nb", no: "nb" };

let strings = en;

// Home Assistant hands the panel the user's own language, which can be a
// region code like "en-GB" or "sv-SE". Only the language part decides.
export function setLanguage(language: string) {
  if (!language) return;
  let code = language.split("-")[0].toLowerCase();
  code = ALIAS[code] || code;
  strings = LANGUAGES[code] || en;
}

// The text for this key, with {0}, {1} ... replaced by the arguments. A key
// that has not been translated yet falls back to English rather than showing
// the key itself, so a half finished language is still usable.
export function localize(key: string, ...args: (string | number)[]): string {
  let text = strings[key] || en[key];
  if (text === undefined) return key;
  return text.replace(/\{(\d+)\}/g, (match, index) => {
    let value = args[Number(index)];
    return value === undefined ? match : `${value}`;
  });
}
