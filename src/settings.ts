import { App, PluginSettingTab, Setting } from "obsidian";

import type TerminologyReplacerPlugin from "./main";
import { parseDictionary } from "./dictionary";

export interface TerminologyReplacerSettings {
  dictionarySource: string;
}

export const DEFAULT_DICTIONARY = [
  "内核 => `kernel`",
  "进程 => `process`",
  "线程 => `thread`",
  "文件描述符 => `file descriptor`",
  "系统调用 => `system call`"
].join("\n");

export const DEFAULT_SETTINGS: TerminologyReplacerSettings = {
  dictionarySource: DEFAULT_DICTIONARY
};

export class TerminologyReplacerSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: TerminologyReplacerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("术语词典")
      .setDesc("每行一条：中文术语 => 替换结果。右侧内容将按字面值插入。")
      .addTextArea((textArea) => {
        textArea
          .setPlaceholder("内核 => `kernel`")
          .setValue(this.plugin.settings.dictionarySource)
          .onChange(async (value) => {
            await this.plugin.updateDictionary(value);
            this.renderDiagnostics(diagnosticsEl);
          });
        textArea.inputEl.addClass("terminology-replacer-dictionary");
      });

    const diagnosticsEl = containerEl.createDiv({
      cls: "terminology-replacer-diagnostics"
    });
    this.renderDiagnostics(diagnosticsEl);
  }

  private renderDiagnostics(element: HTMLDivElement): void {
    element.empty();
    const parsed = parseDictionary(this.plugin.settings.dictionarySource);

    if (parsed.diagnostics.length === 0) {
      element.setText(`已载入 ${parsed.terms.size} 条有效术语。`);
      element.addClass("is-valid");
      return;
    }

    element.removeClass("is-valid");
    element.createDiv({
      text: `已载入 ${parsed.terms.size} 条有效术语；发现 ${parsed.diagnostics.length} 个问题：`
    });
    const list = element.createEl("ul");
    for (const diagnostic of parsed.diagnostics) {
      list.createEl("li", {
        text: `第 ${diagnostic.line} 行：${diagnostic.message}`
      });
    }
  }
}
