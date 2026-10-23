import { DICTIONARY_SEPARATOR, type DictionaryEntry } from "./dictionary";

export interface TerminologyReplacerSettings {
  dictionaryEntries: DictionaryEntry[];
}

const DEFAULT_ENTRIES: readonly DictionaryEntry[] = [
  { term: "内核", replacement: "`kernel`" },
  { term: "进程", replacement: "`process`" },
  { term: "线程", replacement: "`thread`" },
  { term: "文件描述符", replacement: "`file descriptor`" },
  { term: "系统调用", replacement: "`system call`" }
];

function isDictionaryEntry(value: unknown): value is DictionaryEntry {
  return typeof value === "object" && value !== null &&
    "term" in value && typeof value.term === "string" &&
    "replacement" in value && typeof value.replacement === "string";
}

export function loadSettingsData(saved: unknown): TerminologyReplacerSettings {
  if (typeof saved === "object" && saved !== null) {
    if ("dictionaryEntries" in saved && Array.isArray(saved.dictionaryEntries) &&
      saved.dictionaryEntries.every(isDictionaryEntry)) {
      return { dictionaryEntries: saved.dictionaryEntries.map(({ term, replacement }) => ({ term, replacement })) };
    }

    if ("dictionarySource" in saved && typeof saved.dictionarySource === "string") {
      // Preserve duplicate and incomplete legacy rules so users can still edit them.
      const dictionaryEntries = saved.dictionarySource.split(/\r?\n/u)
        .filter((line) => line.trim().length > 0)
        .map((line) => {
          const separator = line.indexOf(DICTIONARY_SEPARATOR);
          return separator < 0
            ? { term: line.trim(), replacement: "" }
            : {
              term: line.slice(0, separator).trim(),
              replacement: line.slice(separator + DICTIONARY_SEPARATOR.length).trim()
            };
        });
      return { dictionaryEntries };
    }
  }

  return { dictionaryEntries: DEFAULT_ENTRIES.map((entry) => ({ ...entry })) };
}
