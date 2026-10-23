import { describe, expect, it } from "vitest";

import { parseDictionary, parseDictionaryEntries } from "../src/dictionary";
import { loadSettingsData } from "../src/settings-data";

describe("loadSettingsData", () => {
  it("preserves legacy replacement behavior including duplicates and literal separators", () => {
    const source = "内核 => `kernel`\r\n\r\n进程 => a => b\r\n内核 => `Linux kernel`";
    const settings = loadSettingsData({ dictionarySource: source });

    expect(settings.dictionaryEntries).toEqual([
      { term: "内核", replacement: "`kernel`" },
      { term: "进程", replacement: "a => b" },
      { term: "内核", replacement: "`Linux kernel`" }
    ]);
    expect([...parseDictionaryEntries(settings.dictionaryEntries).terms])
      .toEqual([...parseDictionary(source).terms]);
  });

  it("retains incomplete legacy rules for correction", () => {
    const settings = loadSettingsData({ dictionarySource: "无分隔符\n=> result\nterm =>" });

    expect(settings.dictionaryEntries).toEqual([
      { term: "无分隔符", replacement: "" },
      { term: "", replacement: "result" },
      { term: "term", replacement: "" }
    ]);
    expect(parseDictionaryEntries(settings.dictionaryEntries).diagnostics).toHaveLength(3);
  });

  it("keeps a deliberately empty dictionary across reloads", () => {
    expect(loadSettingsData({ dictionaryEntries: [] }).dictionaryEntries).toEqual([]);
    expect(loadSettingsData({ dictionarySource: "\n " }).dictionaryEntries).toEqual([]);
  });

  it("round-trips structured rules, including blank draft rows, without restoring legacy data", () => {
    const saved = {
      dictionaryEntries: [
        { term: "", replacement: "" },
        { term: "a => b", replacement: "`c => d`" }
      ],
      dictionarySource: "old => stale"
    };
    const settings = loadSettingsData(saved);

    expect(settings.dictionaryEntries).toEqual(saved.dictionaryEntries);
    expect(loadSettingsData(JSON.parse(JSON.stringify(settings)))).toEqual(settings);
    settings.dictionaryEntries[0]!.term = "changed";
    expect(saved.dictionaryEntries[0]!.term).toBe("");
  });

  it("falls back safely for invalid settings and returns independent defaults", () => {
    const defaults = loadSettingsData(null);
    for (const saved of [undefined, 42, {}, { dictionarySource: null },
      { dictionaryEntries: [null] }, { dictionaryEntries: [{ term: 42, replacement: "x" }] }]) {
      expect(loadSettingsData(saved)).toEqual(defaults);
    }
    defaults.dictionaryEntries[0]!.term = "changed";
    expect(loadSettingsData(null).dictionaryEntries[0]!.term).toBe("内核");
  });
});
