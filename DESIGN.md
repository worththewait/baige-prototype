---
name: 百舸数智平台
description: 以图片入口与分类三列目录组织智能工具的桌面原型
colors:
  canvas: "#f9fbff"
  surface: "#ffffff"
  surface-subtle: "#f1f5ff"
  ink: "#202735"
  muted: "#687187"
  line: "#e9edf5"
  line-strong: "#d4dceb"
  accent: "#245bff"
  accent-hover: "#1546d8"
  accent-soft: "#e7eeff"
  tool-purple: "#8957ed"
  tool-purple-soft: "#f0eaff"
typography:
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "14px"
    lineHeight: 1.6
  headline:
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.6px"
  tools-title:
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
  group-title:
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.5
  tool-name:
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.7
  description:
    fontSize: "12px"
    lineHeight: 1.8
  label:
    fontSize: "13px"
    lineHeight: 1.6
rounded:
  tool-icon: "5px"
  control: "7px"
  featured-art: "12px"
  panel: "14px"
spacing:
  compact: "8px"
  control: "12px"
  icon-copy: "16px"
  tabs: "20px"
  panel: "24px"
  columns: "28px"
  columns-wide: "32px"
  group: "40px"
  content-horizontal: "56px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    typography: "{typography.label}"
  navigation-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-hover}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    width: "230px"
  category-active:
    textColor: "{colors.accent}"
    padding: "6px 0 10px"
    typography: "{typography.label}"
  featured-art:
    rounded: "{rounded.featured-art}"
  tool-icon:
    backgroundColor: "{colors.tool-purple-soft}"
    textColor: "{colors.tool-purple}"
    rounded: "{rounded.tool-icon}"
    width: "50px"
    height: "50px"
---

## Overview

**Creative North Star: "参考图中的桌面工具目录"**

当前桌面版依据用户最初第二张参考图片：白色侧栏、淡蓝白画布与亮蓝导航状态，智能工具页上方为三张深蓝紫几何图片入口，下方为分类三列工具目录。此文档记录已实现的界面，不引入新的设计方向。

**Key Characteristics:**

- 白侧栏与淡蓝白画布
- 亮蓝选择与焦点状态
- 深蓝紫技术几何图片
- 紫色图标、名称、说明组成三列目录

来源为 `index.html`、`pages/*.html`、`styles.css`、`src/pages/*.js` 与 `.impeccable/review/desktop-reference.png`。运行时样式以 `styles.css` 为源。一级页面通过统一入口内的 iframe 展示，共用视觉规范。

## Colors

Primary 为亮蓝 accent 系列，用于导航选中、分类下划线、主按钮、悬停文字和焦点。Secondary 为 tool-purple 系列，用于工具图标及浅紫底板。Neutral 为 canvas、surface、ink、muted 和 line 系列，区分画布、白色侧栏、内容层级与细边界。

深蓝紫图片色彩仅属于图片素材，不扩大成全站背景。前言列出复用的 CSS 色彩变量；单个组件的局部描边与悬停值保留在 sidecar 示例中。

## Typography

全部文字使用本地系统无衬线字体栈，不加载外部字体。页面标题、热门工具标题、分组标题与工具名称分别使用前言对应角色；目录说明为小字号、较宽行距。热门图片标题为白字、半粗体（20px / 600），宽桌面断点后为 24px；图片下的工具名称为 16px / 600。

## Layout

桌面最小宽度为 1120px，不提供手机版。应用高度为 100dvh，默认侧栏 210px，折叠侧栏 72px，全局顶部栏已移除，内容区直接从顶部开始。右侧内容独立滚动，内容最大宽度 1460px，内边距为 40px 56px 48px。

热门图片与工具目录均为三列等宽网格。图片比例为 1.89，默认列间距为前言 columns，工具行距 18px。分类区距图片入口 38px，分组间距为 group。到 1600px 宽度后，内容上边距变为 44px、列间距使用 columns-wide；三列布局保持。

## Elevation & Depth

界面表面不使用 box-shadow，依靠白色与淡蓝白的色差、细描边和空间分组建立层次。深度主要来自三幅几何 SVG 内的渐变与重叠形状。图片标题使用 `text-shadow: 0 2px 10px #05091f`，以便在亮色几何图形上辨认文字。

## Shapes

导航、按钮、搜索框采用控制圆角，图片使用较大图片圆角，工具图标采用紧凑方形底板。知识库面板与输入区使用 panel 圆角。图标来自本地内联 SVG 路径，默认 24×24 viewBox、圆端点描边；目录图标显示为 25px，描边 1.7。

## Components

`index.html` 维护全局侧栏与页面容器；`pages/` 中每个 HTML 维护一个一级菜单页面。页面内部标题、区域、工具目录模板均在对应 HTML 文件中编辑；交互脚本位于 `src/pages/`，图标系统位于 `src/ui.js`。一级页面切换时仅隐藏已有 iframe，智能工具页签与目录状态在本次打开期间保留。

- **导航**：白底侧栏，图标与标签并排；当前页以浅蓝底、深蓝字、600 字重突出。子菜单以细竖线和缩进组织。侧栏可折叠为图标栏。
- **热门图片入口**：三个整块可点击入口，分别为 OCR识别、文档翻译、思维导图生成。图中白字，图下名称与说明；悬停图片缩放至 1.035，名称变蓝并出现箭头。
- **分类标签**：文字与底部 2px 蓝线标记选中，使用 aria-pressed 表达状态；支持全部工具及各分类。
- **工具条目**：50px 浅紫图标底板，右侧为名称及说明；悬停名称变蓝、图标底板略加深，无独立白卡外壳。
- **搜索框**：白底细边框，内置搜索图标；聚焦边框变蓝并出现浅蓝外轮廓。输入按名称或描述即时过滤，与分类筛选组合；空结果提供清除筛选。
- **工具工作区页签**：右侧工作区顶部固定 54px 白色页签栏，左侧「工具目录」固定且不可关闭；工具按打开顺序排列，当前项用蓝色文字与底部 2px 线表示。工具页签含图标、名称和关闭按钮，长标题省略并提供完整 title。中段可横向滚动，右侧「已打开」为完整工具列表。已打开页签在切换栏目后保留。
- **工具详情**：页签栏下展示「返回工具目录」、紫色工具图标、名称与用途说明；未接入内容显示「正在集成」，下方「继续浏览工具」返回目录。各工具以独立页面实例保留状态，目录筛选和滚动位置也独立保留。
- **按钮**：主按钮蓝底白字，次按钮白底描边；所有按钮及链接键盘聚焦显示 2px 蓝色轮廓，偏移 4px。默认颜色过渡 180ms；图片缩放 240ms。减少动态效果偏好关闭过渡与动画。
- **状态与辅助页面**：首页含对话输入区及快捷入口；知识库使用同类标签与白色面板；未接入工具显示“正在集成”。以上是已有页面记录，不构成新的设计探索。

`assets/document-layers.svg`、`assets/language-wave.svg`、`assets/research-flow.svg` 是本项目通过代码生成的几何素材，无外部图片版权依赖。图片、脚本、样式采用相对路径；普通 HTML/CSS/JavaScript 可随文件夹离线分发。

## Do's and Don'ts

- Do 保留智能工具的三张图片入口与分类三列目录。
- Do 使用本地系统字体、内联图标和相对资源路径，保证文件夹离线分发。
- Do 对未接入能力显示“正在集成”，保留可见键盘焦点和减少动态效果设置。
- Don't 将智能工具改回用户已否定的“科研资料工作台”列表方向。
- Don't 添加手机版或窄屏重排；当前范围为桌面。
- Don't 将本地几何 SVG 替换为需要外部联网或版权授权的图片。
