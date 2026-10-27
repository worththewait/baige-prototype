# 百舸工作空间 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this approved design in the existing checkout. Track completion below.

**Goal:** 将已确认的新对话、功能中心、知识库、可固定侧边工作区落实为可离线分发的正式原型。

**Architecture:** src/catalog.js维护唯一叶子功能目录，src/workspace-store.js维护临时打开和本地固定状态；app.js按叶子功能保留独立iframe。页面通过来源验证的page-bridge通信；各业务页仍独立HTML。

**Tech Stack:** 本地HTML/CSS/普通JavaScript，原生dialog，localStorage，无新增依赖。

**Spec:** docs/superpowers/specs/2026-10-22-workspace-design.md

## Global Constraints

- 离线双击HTML；桌面最小1120px；不打包、不提交、不推送。
- 保留当前未提交改动及已有数据集业务内容；不修改AppleDouble文件。
- 新对话的知识库说明不是跳转入口；每个子功能独立卡片。
- 权限申请与问答均为原型，不伪造实际授权和知识检索结果。

## Review Focus

- 多个同父功能必须各自保留页面实例，切换不共享或清空输入。
- 固定数据损坏、浏览器禁用存储、保存了已失去权限的功能时安全退化。
- file协议下仅接收已挂载子窗口消息，不信任任意pageId或子功能参数。
- 取消知识库选择和切换分类不改变已确认范围；空选择不可确认。
- 旧hash、独立HTML及父级目录入口仍可导航到正确页面。

### Task 1: 统一叶子目录与工作区状态
- [x] 新增src/catalog.js：entries/get/getByKey/keyFor，27个叶子项。
- [x] 新增src/workspace-store.js：create/open/togglePin/items/isPinned；仅持久化固定key，验证权限和存储内容。
- [x] 用临时Node合同检查验证目录完整、权限隔离、存储损坏退化与固定恢复。

### Task 2: 侧栏与页面实例
- [x] 修改index.html、src/app.js、src/page-bridge.js：三个主入口、动态工作区、图钉、独立iframe、旧路由兼容。
- [x] 固定状态反馈到页面标题操作，默认新对话，不复制工具内部页签。
- [x] 新增pages/tool.html与src/pages/tool.js，保留具体工具入口与正在集成状态。

### Task 3: 功能中心与问答
- [x] 新增pages/center.html与src/pages/center.js，复用home-access.js的模拟权限流程；单一叶子卡片、跨目录搜索与筛选。
- [x] 重做pages/home.html与src/pages/conversation.js，支持同页消息、草稿、知识库选择、附件名称展示、新对话重置。
- [x] 知识库页使用共享示例数据，不虚构内容。旧qa与smart-tools独立入口兼容新结构。

### Task 4: 视觉与验证
- [x] 更新全局tokens与工作空间样式，新增workspace.css组织新界面，保持已有业务布局。
- [x] 浏览器检查新对话、功能中心、知识库、工作区固定与重开；检查1120/1440/1920桌面宽度。独立文件的本地资源静态检查完成，file协议浏览器检查受工具安全策略限制。
- [x] 执行设计技能lint/inspect（本地内置新版Node），截图复核并修复真实布局问题。
- [x] 更新README/PRODUCT/DESIGN，独立审阅后处理重要问题。

## 执行说明

用户已在多轮草图后明确要求按方案实施，无额外确认轮次。当前目录是用户一直使用的原型，保留该目录直接修改；不创建隔离副本导致用户看不到结果。已有uncommitted修改不回滚，不自动commit。CSS/HTML以视觉与交互检查验证，目录与存储采用必要的纯逻辑合同检查，不引入测试框架。

## 完成记录

- 新增叶子目录、固定状态存储、功能中心、共享问答和单工具页面，保留已有业务内容。
- 本机预览确认：跨分类选择与取消、草稿保留、独立文档/文本翻译实例、固定恢复、取消固定、模拟申请。
- 独立只读审阅未发现Critical；修复新对话未关闭旧知识库弹窗并遗留草稿的Minor问题，浏览器复核重新打开为0项且确认禁用。
- 17个JavaScript语法检查及所有HTML本地资源路径检查通过。新增运行文件设计lint为0 FAIL / 4 WARN（仅真实浮层阴影及backdrop-filter:none误报）。
- home / center / knowledge的1120、1440、1920检查均为0 FAIL，各2 WARN；逐项说明见.taste-skill/critique-workspace.md。
- 自动浏览器禁止file协议，未尝试绕过；不能声称实际file协议交互已验证。无远程依赖、普通脚本与相对路径方案维持离线要求。
- README、PRODUCT、DESIGN已与实际结构同步。未生成ZIP，未提交或推送Git。
