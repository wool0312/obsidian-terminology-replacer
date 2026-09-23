import { MarkdownView, Notice, Plugin } from "obsidian";

import { findLongestSuffix, parseDictionary, type ParsedDictionary } from "./dictionary";
import {
  DEFAULT_SETTINGS,
  TerminologyReplacerSettingTab,
  type TerminologyReplacerSettings
} from "./settings";

export default class TerminologyReplacerPlugin extends Plugin {
  settings: TerminologyReplacerSettings = DEFAULT_SETTINGS;
  private dictionary: ParsedDictionary = parseDictionary(DEFAULT_SETTINGS.dictionarySource);

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addCommand({
      id: "replace-current-terminology",
      name: "替换当前术语",
      callback: () => this.replaceCurrentTerminology()
    });

    this.addSettingTab(new TerminologyReplacerSettingTab(this.app, this));
  }

  async updateDictionary(dictionarySource: string): Promise<void> {
    this.settings.dictionarySource = dictionarySource;
    this.dictionary = parseDictionary(dictionarySource);
    await this.saveData(this.settings);
  }

  private async loadSettings(): Promise<void> {
    const saved = (await this.loadData()) as Partial<TerminologyReplacerSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...saved };
    this.dictionary = parseDictionary(this.settings.dictionarySource);
  }

  private replaceCurrentTerminology(): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view === null) {
      new Notice("当前没有活动的 Markdown 编辑器");
      return;
    }

    if (this.dictionary.terms.size === 0) {
      new Notice("词典中没有任何有效规则");
      return;
    }

    const editor = view.editor;
    if (editor.somethingSelected()) {
      const selection = editor.getSelection();
      const replacement = this.dictionary.terms.get(selection);
      if (replacement === undefined) {
        new Notice("选中的文本不在词典中");
        return;
      }

      editor.replaceSelection(replacement);
      return;
    }

    const cursor = editor.getCursor();
    const textBeforeCursor = editor.getLine(cursor.line).slice(0, cursor.ch);
    const term = findLongestSuffix(textBeforeCursor, this.dictionary);
    if (term === null) {
      new Notice("光标前没有匹配的术语");
      return;
    }

    const replacement = this.dictionary.terms.get(term);
    if (replacement === undefined) {
      return;
    }

    editor.replaceRange(
      replacement,
      { line: cursor.line, ch: cursor.ch - term.length },
      cursor
    );
  }
}
