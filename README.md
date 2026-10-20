# 百舸数智平台原型

无构建步骤、无第三方运行时依赖的桌面交互原型。`index.html` 是统一入口，每个一级菜单均有独立 HTML 文件，便于分别维护。

## 打开与分享

双击根目录的 `index.html`，用浏览器打开即可，无需安装依赖、启动服务或联网。

发给同事时发送完整 ZIP；从 GitHub 下载时使用 Code → Download ZIP。先完整解压，再双击 `index.html`。请保留 `pages`、`src`、`assets` 和 `styles.css` 的相对位置。

`pages/` 内各 HTML 也可单独打开，显示该菜单的内容。要查看带侧栏导航的完整平台，请从 `index.html` 进入。子页面中的跨菜单快捷入口会跳回统一入口。

## 页面文件对应关系

```text
index.html                    统一入口与共享侧栏
pages/
  home.html                   首页
  qa.html                     百舸问答（对话、智能问数）
  knowledge.html              知识库
  writing.html                百舸写作
  library.html                百舸文库
  intel.html                  百舸情报
  analysis.html               百舸分析
  smart-tools.html            智能工具（目录与工具详情模板）
  frontier.html               前沿工具（全球鹰、智研通）
  digital.html                数智系统
  datasets.html               高质量数据集
  platform.html               智能开发平台
  data-platform.html          数据平台
```

## 代码维护

- 修改某页标题、文案、区域或布局结构：编辑对应的 `pages/*.html`。
- 修改页面交互：编辑 `src/pages/` 下的对应脚本。首页与百舸问答共用 `home.js` 表单逻辑；尚未接入内容的页面共用 `placeholder.js` 子菜单标题切换逻辑。
- 修改导航名称、子菜单、目标 HTML 路径或工具分类：编辑 `src/data.js`。导航中的 `file` 明确指定一级页面 HTML。
- 修改统一入口的导航和页面切换：编辑 `src/app.js`。
- 修改页面与入口的导航通信：编辑 `src/page-bridge.js`。
- 修改工具页签、关闭行为和页面保留方式：编辑 `src/tool-workspace.js`。
- 修改全站配色、间距和组件样式：编辑 `styles.css`；共用 SVG 图标在 `src/ui.js`。
- 图片位于 `assets/`，使用相对路径。`pages/` 内的资源路径以 `../` 开头。

导航配置、工具数据与 HTML 分开；独立页面通过普通 script 标签按顺序加载 `data.js`、`ui.js`、`page-bridge.js`，最后加载该页交互脚本。智能工具额外加载 `tool-workspace.js`。

共享入口用 iframe 加载各个真实 HTML 文件。页面首次进入时创建，再次进入时复用。入口与页面使用 postMessage 交换导航信息，并核对发送窗口与菜单配置；不依赖 fetch、ES modules 或 HTTP 服务，也不跨文档读取 DOM。这使 file:// 下的本地 HTML 仍能工作。

## 智能工具页签

- 「工具目录」固定不可关闭；选择工具后新增页签，重复选择时激活已有页签。
- 可通过目录、详情页「返回工具目录」「继续浏览工具」继续选择其他工具。
- 每个工具独立保留页面和滚动位置；目录保留搜索词、分类和滚动位置。
- 切换到知识库等一级菜单后，已打开工具仍保留；再次点击「智能工具」先显示目录。
- 关闭当前工具后选中左侧相邻页签，最后一个工具关闭后回到目录。
- 页签过多时横向滚动；「已打开」提供完整列表。页签支持左右方向键、Home / End 和 Delete；Escape 收起列表。
- 浏览器后退、前进根据统一入口的 hash 切换页面。历史记录中的已关闭工具再次进入时会重新创建。
- 当前仅保留本次打开期间的状态。刷新或关闭浏览器后，不恢复全部页签、输入与文件。
- 真实工具接入时，在 `pages/smart-tools.html` 的模板及 `src/pages/smart-tools.js` 的 `renderToolPage(tool, root)` 中维护。每个工具的查询与渲染限定在自己的 `root` 内。
- 工具内 input / change 会标记未保存状态；关闭前确认，离开网页时使用浏览器原生提醒。实际保存后调用 `toolWorkspace.setDirty(tool.name, false)`；非表单组件应主动更新该状态。

## 产品与视觉约定

- 百舸问答下含「对话」和「智能问数」。知识库是统一页面，没有侧栏下拉菜单。
- 智能开发平台不含 PA、知识工程子菜单。
- 12 个智能工具按文档处理、写作创作、研究辅助分组；「标准编制」和「专利分析」是两个独立工具。
- 未接入内容显示「正在集成」。当前不会实际上传文件、执行翻译或发送对话。
- 白色侧栏、浅蓝白内容区、蓝色选择状态、紫色工具图标；热门工具为三张横向图片，下方三列分类目录。
- 工具目录内有搜索框，Ctrl K / ⌘ K 可进入工具搜索。
- 仅设计桌面版，完整平台最小宽度 1120px；全局顶部栏已移除。
- `DESIGN.md` 记录开发用视觉规范，`PRODUCT.md` 记录产品约束。

## 更新分发包

在完整源码目录运行：

```bash
python3 scripts/package.py
```

生成根目录下的 `百舸数智平台原型.zip`。脚本收录入口、样式、README，以及 `pages/`、`src/`、`assets/` 中的运行文件；排除隐藏文件、macOS 元数据、开发截图等。新增 HTML 或页面脚本会自动进入分发包。

同事只需解压打开 HTML，不需要运行打包脚本或安装 Python。
