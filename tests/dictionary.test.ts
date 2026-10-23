import { describe, expect, it } from "vitest";

import { findLongestSuffix, parseDictionary, parseDictionaryEntries } from "../src/dictionary";

describe("parseDictionary", () => {
  it("parses valid rules and preserves literal Markdown", () => {
    const parsed = parseDictionary("内核 => `kernel`\n进程 => process");

    expect([...parsed.terms]).toEqual([
      ["内核", "`kernel`"],
      ["进程", "process"]
    ]);
    expect(parsed.diagnostics).toEqual([]);
  });

  it("keeps valid rules while reporting malformed and duplicate lines", () => {
    const parsed = parseDictionary(
      "内核 => `kernel`\n无分隔符\n内核 => `Linux kernel`\n=> missing\nempty =>"
    );

    expect(parsed.terms.get("内核")).toBe("`Linux kernel`");
    expect(parsed.diagnostics).toEqual([
      { line: 2, message: "缺少分隔符 =>" },
      { line: 3, message: "重复术语“内核”，覆盖第 1 行" },
      { line: 4, message: "术语不能为空" },
      { line: 5, message: "替换结果不能为空" }
    ]);
  });
});

describe("parseDictionaryEntries", () => {
  it("treats separators as literal text in either field", () => {
    const parsed = parseDictionaryEntries([
      { term: "a => b", replacement: "`c => d`" }
    ]);

    expect(parsed.terms.get("a => b")).toBe("`c => d`");
    expect(findLongestSuffix("Example: a => b", parsed)).toBe("a => b");
    expect(parsed.diagnostics).toEqual([]);
  });

  it("ignores blank draft rows and reports incomplete rows at their visible positions", () => {
    const parsed = parseDictionaryEntries([
      { term: " ", replacement: "" },
      { term: "", replacement: "kernel" },
      { term: "内核", replacement: " " },
      { term: " 进程 ", replacement: " `process` " }
    ]);

    expect([...parsed.terms]).toEqual([["进程", "`process`"]]);
    expect(parsed.diagnostics).toEqual([
      { line: 2, message: "术语不能为空" },
      { line: 3, message: "替换结果不能为空" }
    ]);
  });

  it("uses the last valid duplicate while retaining an earlier valid rule after an incomplete one", () => {
    const parsed = parseDictionaryEntries([
      { term: "内核", replacement: "kernel" },
      { term: "内核", replacement: "Linux kernel" },
      { term: "内核", replacement: "" }
    ]);

    expect(parsed.terms.get("内核")).toBe("Linux kernel");
    expect(parsed.diagnostics).toEqual([
      { line: 2, message: "重复术语“内核”，覆盖第 1 行" },
      { line: 3, message: "替换结果不能为空" }
    ]);
  });
});

describe("findLongestSuffix", () => {
  it("prefers the longest matching suffix", () => {
    const parsed = parseDictionary(
      "空间 => `space`\n内核空间 => `kernel space`\n内核 => `kernel`"
    );

    expect(findLongestSuffix("Linux 的内核空间", parsed)).toBe("内核空间");
  });

  it("returns null when no term matches", () => {
    const parsed = parseDictionary("内核 => `kernel`");

    expect(findLongestSuffix("Linux 的进程", parsed)).toBeNull();
  });
});
