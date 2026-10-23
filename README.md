# Terminology Replacer

一个个人使用的 Obsidian 插件：通过显式命令，将选中的术语或光标前的术语替换为可配置的字面文本。

## 使用

1. 在插件设置页维护词典，每行左侧填写原术语，右侧填写替换内容。点击“添加新行”增加规则，点击行末删除按钮移除规则，修改自动保存。
2. 在 Obsidian 的“设置 → 快捷键”中找到“Terminology Replacer: 替换当前术语”，绑定 `Ctrl+;` 或其他快捷键。
3. 选中一个完整术语，或把光标放在术语末尾，执行命令。

无选区时采用最长后缀匹配；有选区时只进行选区精确匹配。替换结果按设置中的内容原样插入。

输入框两端的空白会在匹配和替换时去除。空白行不参与替换；只填写一侧时会提示错误；重复术语以后面的规则为准。旧版文本词典会在加载时自动转换为逐行规则，并在首次编辑后保存为新格式。

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

## 发布版本

本地开发和测试无需每次修改版本号。正式发布新版前，应同步更新 `manifest.json`、`package.json` 和 `package-lock.json` 中的项目版本，并使用相同版本号创建 Git 标签及 GitHub Release。设置页改版可作为下一版 `0.2.0` 发布。
