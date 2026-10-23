import { App, Notice, PluginSettingTab, Setting } from "obsidian";

import type TerminologyReplacerPlugin from "./main";
import { parseDictionaryEntries } from "./dictionary";

export class TerminologyReplacerSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: TerminologyReplacerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("terminology-replacer-settings");
    new Setting(containerEl)
      .setName("术语词典")
      .setDesc("将左侧术语替换为右侧内容，支持 Markdown。修改自动保存。")
      .setHeading();

    const entries = this.plugin.settings.dictionaryEntries.map((entry) => ({ ...entry }));
    const tableEl = containerEl.createDiv({ cls: "terminology-replacer-table" });
    tableEl.setAttribute("role", "group");
    tableEl.setAttribute("aria-label", "术语替换规则");
    const headerEl = tableEl.createDiv({ cls: "terminology-replacer-header" });
    headerEl.createSpan({ text: "原术语" });
    headerEl.createSpan({ text: "替换内容" });
    const rowsEl = tableEl.createDiv({ cls: "terminology-replacer-rows" });
    const actionsEl = containerEl.createDiv({ cls: "terminology-replacer-actions" });
    const diagnosticsEl = containerEl.createDiv({ cls: "terminology-replacer-diagnostics" });
    diagnosticsEl.setAttribute("aria-live", "polite");

    const persist = (): void => {
      const save = this.plugin.updateDictionary(entries);
      this.renderDiagnostics(diagnosticsEl);
      void save.catch(() => {
        new Notice("术语词典保存失败，请重试；当前修改尚未保存到磁盘。");
      });
    };

    const renderRows = (): void => {
      rowsEl.empty();
      if (entries.length === 0) {
        rowsEl.createEl("p", {
          text: "还没有替换规则，点击下方按钮添加。",
          cls: "terminology-replacer-empty"
        });
      }

      entries.forEach((entry, index) => {
        const row = new Setting(rowsEl).setClass("terminology-replacer-row");
        row.addText((text) => {
          text.setPlaceholder("例如：内核").setValue(entry.term).onChange((value) => {
            entry.term = value;
            persist();
          });
          text.inputEl.addClass("terminology-replacer-field");
          text.inputEl.setAttribute("aria-label", `第 ${index + 1} 行原术语`);
        });
        row.controlEl.createSpan({ text: "→", cls: "terminology-replacer-arrow" })
          .setAttribute("aria-hidden", "true");
        row.addText((text) => {
          text.setPlaceholder("例如：`kernel`").setValue(entry.replacement).onChange((value) => {
            entry.replacement = value;
            persist();
          });
          text.inputEl.addClass("terminology-replacer-field", "terminology-replacer-replacement");
          text.inputEl.setAttribute("aria-label", `第 ${index + 1} 行替换内容`);
        });
        row.addExtraButton((button) => {
          button.setIcon("trash").setTooltip(`删除第 ${index + 1} 行`).onClick(() => {
            entries.splice(index, 1);
            persist();
            renderRows();
          });
          button.extraSettingsEl.setAttribute("aria-label", `删除第 ${index + 1} 行`);
        });
      });
    };

    new Setting(actionsEl).addButton((button) => {
      button.setButtonText("添加新行").setIcon("plus").onClick(() => {
        entries.push({ term: "", replacement: "" });
        persist();
        renderRows();
        rowsEl.querySelector<HTMLInputElement>(".terminology-replacer-row:last-child input")?.focus();
      });
    });

    renderRows();
    this.renderDiagnostics(diagnosticsEl);
  }

  private renderDiagnostics(element: HTMLDivElement): void {
    element.empty();
    const parsed = parseDictionaryEntries(this.plugin.settings.dictionaryEntries);

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
