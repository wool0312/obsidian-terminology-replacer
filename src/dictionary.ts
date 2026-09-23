export const DICTIONARY_SEPARATOR = "=>";

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
  const terms = new Map<string, string>();
  const definedAt = new Map<string, number>();
  const diagnostics: DictionaryDiagnostic[] = [];

  source.split(/\r?\n/u).forEach((rawLine, index) => {
    const line = index + 1;
    if (rawLine.trim().length === 0) {
      return;
    }

    const separatorIndex = rawLine.indexOf(DICTIONARY_SEPARATOR);
    if (separatorIndex < 0) {
      diagnostics.push({ line, message: `缺少分隔符 ${DICTIONARY_SEPARATOR}` });
      return;
    }

    const term = rawLine.slice(0, separatorIndex).trim();
    const replacement = rawLine
      .slice(separatorIndex + DICTIONARY_SEPARATOR.length)
      .trim();

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
