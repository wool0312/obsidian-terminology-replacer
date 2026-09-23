# Terminology Replacer

一个个人使用的 Obsidian 插件：通过显式命令，将选中的术语或光标前的术语替换为可配置的字面文本。

## 使用

1. 在插件设置页维护词典，每行格式为 `中文术语 => 替换结果`。
2. 在 Obsidian 的“设置 → 快捷键”中找到“Terminology Replacer: 替换当前术语”，绑定 `Ctrl+;` 或其他快捷键。
3. 选中一个完整术语，或把光标放在术语末尾，执行命令。

无选区时采用最长后缀匹配；有选区时只进行选区精确匹配。替换结果按设置中的内容原样插入。

## 开发

```bash
npm install
npm test
npm run build
```

本地安装时，将 `main.js`、`manifest.json` 和 `styles.css` 放入：

```text
<vault>/.obsidian/plugins/terminology-replacer/
```
