// Tests that keep the panel's eight languages in step with each other and with
// the code.
//
//   npm test
//
// A text added in English and forgotten in one language falls back on English
// there without a word - nothing breaks, it is just quietly untranslated. And
// a text left behind when the code stops using it is carried in eight
// languages for nothing. Both are failures here.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

import { USED_BY_KINDS } from "../src/logic.ts";

const SRC = new URL("../src/", import.meta.url);
const LOCALIZE = new URL("localize/", SRC);
const API = new URL("../custom_components/ihcviewer/", import.meta.url);

const codes = readdirSync(LOCALIZE)
  .filter((file) => file.endsWith(".ts") && file !== "index.ts")
  .map((file) => file.replace(".ts", ""))
  .sort();
const tables = {};
for (const code of codes) {
  tables[code] = (await import(new URL(`${code}.ts`, LOCALIZE)))[code];
}
const en = tables.en;
const keys = Object.keys(en).sort();

const placeholders = (text) => (`${text}`.match(/\{\d+\}/g) || []).sort();

// Everything the texts can be asked for from: the panel's own code, and the
// Python api, which answers with keys the panel then says in the user's
// language (rename_id_taken, add_already_set_up and so on)
function read(dir, ending, skip = "") {
  return readdirSync(dir, { recursive: true })
    .filter((file) => file.endsWith(ending) && !(skip && file.startsWith(skip)))
    .map((file) => readFileSync(new URL(file.replace(/\\/g, "/"), dir), "utf-8"))
    .join("\n");
}
const code = read(SRC, ".ts", "localize");
const python = read(API, ".py");

// Keys the code builds rather than writes out: add_${platform}_help, and
// used_${kind} for the headings in the remove dialog
const USED = [...USED_BY_KINDS, "dashboard"];
const BUILT = new RegExp(
  `^(add_(binary_sensor|light|sensor|switch)_help|used_(${USED.join("|")}))$`);

describe("the languages", () => {
  test("the panel loads every language file there is", () => {
    const index = readFileSync(new URL("index.ts", LOCALIZE), "utf-8");
    for (const lang of codes) {
      assert.match(index, new RegExp(`import \\{ ${lang} \\} from "\\./${lang}"`), lang);
    }
    assert.deepEqual(codes, ["da", "en", "et", "fi", "lt", "lv", "nb", "sv"]);
  });

  for (const lang of codes.filter((c) => c !== "en")) {
    test(`${lang} has every text English has, and no other`, () => {
      assert.deepEqual(Object.keys(tables[lang]).sort(), keys);
    });

    test(`${lang} keeps the placeholders`, () => {
      for (const key of keys) {
        assert.deepEqual(placeholders(tables[lang][key]), placeholders(en[key]), key);
      }
    });
  }

  test("no text is empty", () => {
    for (const lang of codes) {
      for (const key of keys) {
        assert.ok(`${tables[lang][key] || ""}`.trim(), `${lang}.${key}`);
      }
    }
  });
});

describe("the code and the texts", () => {
  test("every text the code asks for exists", () => {
    const asked = [...code.matchAll(/localize\(\s*["'`]([a-z0-9_]+)["'`]/g)].map((m) => m[1]);
    const missing = [...new Set(asked)].filter((key) => !(key in en));
    assert.deepEqual(missing, []);
  });

  test("every text is used", () => {
    const unused = keys.filter((key) =>
      !BUILT.test(key)
      && !["\"", "'", "`"].some((q) => code.includes(q + key + q))
      && !python.includes(`"${key}"`));
    assert.deepEqual(unused, []);
  });

  test("the texts the code builds exist for every platform", () => {
    for (const platform of ["binary_sensor", "light", "sensor", "switch"]) {
      assert.ok(`add_${platform}_help` in en, platform);
    }
  });

  test("the remove dialog has a heading for everything it can list", () => {
    for (const kind of USED) {
      assert.ok(`used_${kind}` in en, kind);
    }
  });
});
