# Terminology Replacer

一个用于统一 Obsidian 笔记术语的插件。通过命令或自定义快捷键，将选中的术语或光标前的术语替换为你配置的文本，适合中英文术语转换和常用 Markdown 片段输入。

Terminology Replacer replaces selected text or a matching term immediately before the cursor with a configurable replacement in Obsidian. Use it to keep terminology consistent, convert terms between languages, or insert Markdown snippets. Replacements run only when you execute the command or a custom hotkey.

当前代码版本：**0.2.1。插件声明的最低 Obsidian 版本为 **1.5.0**。

## 功能

- **手动触发替换**：通过命令面板或自定义快捷键执行。
- **选区精确匹配**：选中完整术语后，用对应规则替换。
- **最长后缀匹配**：没有选区时，优先匹配当前行光标前最长的术语。
- **逐行编辑词典**：设置页使用统一表头，每行两个输入框，支持添加和删除规则。
- **自动保存与诊断**：修改即时生效并自动保存，显示有效规则数量、未填完整的规则和重复术语。
- **支持 Markdown**：替换内容可以包含反引号、加粗标记、链接等文本。
- **兼容旧词典**：自动读取旧版 `术语 => 替换内容` 格式的配置。

## Installation

### Manual installation

Requires Obsidian **1.5.0 or later**, as declared in the plugin manifest.

1. Open the [GitHub Releases page](https://github.com/wool0312/obsidian-terminology-replacer/releases) and choose a release.
2. Download `main.js`, `manifest.json`, and `styles.css` from its **Assets** section.
3. Create `<vault>/.obsidian/plugins/terminology-replacer/` and copy the three files into that folder. Replace `<vault>` with your Obsidian vault directory.
4. Reload Obsidian, then enable **Terminology Replacer** under **Settings → Community plugins**. Turn off Restricted mode if needed.

Use the three release assets for installation. The automatically generated source archives require a build before installation. When updating, replace the same three files and keep `data.json` to retain your dictionary.

### 中文安装说明

1. 打开本仓库的 [Releases 页面](https://github.com/wool0312/obsidian-terminology-replacer/releases)，选择需要的版本。
2. 在该版本的 **Assets** 中下载以下三个文件：
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. 在你的 Obsidian 仓库中创建以下目录，并将三个文件放入其中：

   ```text
   <vault>/.obsidian/plugins/terminology-replacer/
   ├── main.js
   ├── manifest.json
   └── styles.css
   ```

4. 重新加载 Obsidian，在“设置 → 第三方插件”中启用 **Terminology Replacer**。如果尚未启用第三方插件，需要先关闭受限模式。

其中 `<vault>` 是你的笔记仓库目录。请下载 Release 附件中的三个文件；GitHub 自动提供的 `Source code` 压缩包是源码，需要自行构建后才能安装。

## Usage

### Quick start

1. Open **Settings → Terminology Replacer**.
2. Each row defines one replacement: enter the original term in the left field (**原术语**) and the replacement text in the right field (**替换内容**). Click **添加新行** to add a row or the trash icon to remove it. Changes are saved automatically.
3. For example, use the default rule that replaces `内核` with the Markdown text `` `kernel` ``.
4. In a Markdown editor, select the complete term, or place the cursor immediately after it. Open the command palette and run **Terminology Replacer: 替换当前术语**.
5. To use a hotkey, find the command under **Settings → Hotkeys** and assign your preferred key combination. No hotkey is assigned by default.

A selection must match a dictionary term exactly. Without a selection, the longest matching suffix on the current line before the cursor is replaced. Matching is case-sensitive and does not check word boundaries or Markdown contexts. Leading and trailing whitespace in both fields is trimmed. Empty rows are ignored, incomplete rows are reported, and the last valid rule wins when a term is duplicated.

### 配置词典

打开“设置 → Terminology Replacer”：

- 在左侧 **原术语** 输入需要匹配的文本。
- 在右侧 **替换内容** 输入要插入的文本。
- 点击 **添加新行** 增加规则，点击行末的删除按钮移除规则。
- 修改会自动保存，无需额外点击保存按钮。

插件内置以下规则，可以按需修改或删除。表格右侧的反引号也是替换内容的一部分：

| 原术语 | 替换内容 |
| --- | --- |
| 内核 | `` `kernel` `` |
| 进程 | `` `process` `` |
| 线程 | `` `thread` `` |
| 文件描述符 | `` `file descriptor` `` |
| 系统调用 | `` `system call` `` |

### 执行替换

在 Markdown 编辑器中，使用下面任意一种方式：

- **选中术语**：例如选中“内核”，执行替换命令。
- **将光标放在术语末尾**：例如输入“Linux 的内核”，将光标放在“核”后面，再执行替换命令。

打开命令面板，搜索并执行 **Terminology Replacer: 替换当前术语**。也可以在“设置 → 快捷键”中搜索这个命令并绑定快捷键，例如 Windows 下的 `Ctrl+;`。插件不预设快捷键。

使用默认规则替换后，Markdown 源码示例为：

```markdown
替换前：Linux 的内核
替换后：Linux 的`kernel`
```

### 匹配规则与限制

- 有选区时，整个选区必须与词典中的原术语完全一致；不会在选区内部逐词替换。
- 没有选区时，只检查当前行光标前的文本，优先匹配最长术语。例如同时配置了“空间”和“内核空间”时，会优先匹配“内核空间”。
- 匹配区分大小写，不额外检查英文单词边界，也不区分代码、链接等 Markdown 上下文。
- 两个输入框首尾的空白会在匹配和替换时去除，其余内容按字面值插入。
- 两侧都为空的行作为草稿保留，不参与替换；只填写一侧时会提示错误，该行不参与替换。
- 同一个术语有多条有效规则时，最后一条生效，并显示重复提示。
- 找不到匹配项时会显示提示，保留原文。

## 更新与配置保留

1. 下载新版本的 `main.js`、`manifest.json` 和 `styles.css`。
2. 关闭插件，用新文件覆盖插件目录中同名的三个文件。
3. 重新启用插件。

词典配置保存在插件目录中的 `data.json`。更新前可以备份该文件，更新时保留它，以继续使用已有词典。

旧版文本词典会在加载时自动转换为逐行规则，保留重复项和未填完整的规则供继续编辑，并在首次编辑后保存为新格式。

## 开发

安装依赖、运行测试并生成生产构建：

```bash
npm ci
npm test
npm run build
```

构建会在项目根目录生成 `main.js`。将它与 `manifest.json`、`styles.css` 一起复制到测试仓库的插件目录，重新加载插件后验证。

开发时可以启用监听构建：

```bash
npm run dev
```

监听构建会更新项目中的 `main.js`，仍需将构建文件同步到 Obsidian 插件目录并重新加载插件。若 Windows PowerShell 提示无法运行 `npm.ps1`，可将上述命令中的 `npm` 换为 `npm.cmd`。

## 发布版本

本地开发和测试无需每次修改版本号。发布新的插件版本时：

1. 同步更新 `manifest.json`、`package.json` 和 `package-lock.json` 中的项目版本号，包括锁文件顶层及 `packages[""]` 中的 `version`。
2. 运行测试和生产构建，并在 Obsidian 中验证。
3. 提交并推送源码和版本文件。
4. 创建 GitHub Release，标签与 `manifest.json` 的版本号完全一致，例如 `0.2.0`，不加 `v` 前缀。
5. 上传与该版本源码对应的 `main.js`、`manifest.json` 和 `styles.css`，填写发布说明后发布。

`main.js` 是被 Git 忽略的构建产物，需要作为 Release 附件单独上传。

## License

Licensed under the [MIT License](LICENSE). Copyright (c) 2026 wool0312.

本项目采用 [MIT 许可证](LICENSE)，允许使用、修改和再分发（包括商业用途），但需要保留版权及许可证声明。
