export const DICTIONARY_SEPARATOR = "=>";

export interface DictionaryEntry {
  term: string;
  replacement: string;
}

export interface DictionaryDiagnostic {
  line: number;
  message: string;
}

export interface ParsedDictionary {
  terms: ReadonlyMap<string, string>;
  sortedKeys: readonly string[];
  diagnostics: readonly DictionaryDiagnostic[];
}

export function parseDictionary(source: string): ParsedDictionary {
  const rows = source.split(/\r?\n/u).map((rawLine) => {
    if (rawLine.trim().length === 0) {
      return null;
    }
    const separatorIndex = rawLine.indexOf(DICTIONARY_SEPARATOR);
    if (separatorIndex < 0) {
      return { message: `缺少分隔符 ${DICTIONARY_SEPARATOR}` };
    }
    return {
      term: rawLine.slice(0, separatorIndex),
      replacement: rawLine.slice(separatorIndex + DICTIONARY_SEPARATOR.length)
    };
  });
  return buildDictionary(rows);
}

export function parseDictionaryEntries(entries: readonly DictionaryEntry[]): ParsedDictionary {
  return buildDictionary(entries.map((entry) =>
    entry.term.trim().length === 0 && entry.replacement.trim().length === 0 ? null : entry
  ));
}

function buildDictionary(
  rows: readonly (DictionaryEntry | { message: string } | null)[]
): ParsedDictionary {
  const terms = new Map<string, string>();
  const definedAt = new Map<string, number>();
  const diagnostics: DictionaryDiagnostic[] = [];

  rows.forEach((row, index) => {
    const line = index + 1;
    if (row === null) {
      return;
    }

    if ("message" in row) {
      diagnostics.push({ line, message: row.message });
      return;
    }

    const term = row.term.trim();
    const replacement = row.replacement.trim();

    if (term.length === 0) {
      diagnostics.push({ line, message: "术语不能为空" });
      return;
    }

    if (replacement.length === 0) {
      diagnostics.push({ line, message: "替换结果不能为空" });
      return;
    }

    const previousLine = definedAt.get(term);
    if (previousLine !== undefined) {
      diagnostics.push({
        line,
        message: `重复术语“${term}”，覆盖第 ${previousLine} 行`
      });
    }

    terms.set(term, replacement);
    definedAt.set(term, line);
  });

  const sortedKeys = [...terms.keys()].sort(
    (left, right) => right.length - left.length || left.localeCompare(right)
  );

  return { terms, sortedKeys, diagnostics };
}

export function findLongestSuffix(
  textBeforeCursor: string,
  dictionary: ParsedDictionary
): string | null {
  return dictionary.sortedKeys.find((term) => textBeforeCursor.endsWith(term)) ?? null;
}
