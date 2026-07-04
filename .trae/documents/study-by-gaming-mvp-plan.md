# Study by Gaming MVP 计划文档（代码工程级）

生成日期：2026-07-04
目标：在 `src/mvp` 落地一个可演示、可打包成单 HTML 的"Ascend C 算子开发指南"游戏化学习闭环。
依据：`docs/02_Study_by_Gaming_MVP需求文档.md`、`docs/03_Study_by_Gaming_MVP技术架构文档.md`、`pdf2md/output/method3_pymupdf/CANN_Ascend_C算子开发指南.md`。

---

## 0. 已锁定决策（无需再议）

| 维度 | 决策 |
|---|---|
| 技术栈 | Vite + React 18 + TypeScript（遵循 web-artifacts-builder 技能） |
| UI | shadcn/ui + Tailwind CSS 3.4 + Radix UI（技能预装 40+ 组件） |
| 动画 | Framer Motion（hero 入场、关卡解锁、XP 反馈） |
| 路由 | 单页 view 状态机（不引入 react-router，`view` 字段切换） |
| 状态 | Zustand（当前 view/quest/XP/事件） |
| 存储 | localStorage（学习事件持久化，刷新不丢） |
| 视觉风格 | 暗色 NPU 幻想游戏风（npu-fantasy），深色底 + 单一品牌强调色 + 发光，遵循 frontend-skill「全幅视觉锚点、品牌名最响、克制色彩」原则 |
| 内容来源 | PDF markdown 精准取材（已核验页码 p.36-43、p.4549-4712 等） |
| 交付 | 计划文档 + 工程实现 + 演示脚本 + 验收清单 |
| 不做 | Next.js、后端、数据库、实时 LLM、真实编译、移动端适配、完整 PDF 解析 |

---

## 1. 现状分析

- `src/mvp` 目录**尚不存在**，从零搭建。
- PDF markdown 已就绪：`pdf2md/output/method3_pymupdf/CANN_Ascend_C算子开发指南.md`（含 images/）。
- 需求文档第 6 节给出 5 关设计，第 7 节给出 P0 功能矩阵，第 9 节给出页面原型文案；技术架构第 4-6 节给出模块/Schema/组件结构。可直接落地，无需重新设计。
- 已精准检索到的关键 PDF 素材（页码准确）：
  - 什么是 Ascend C / 多层级 API（基础/高阶/算子模板库/Python 前端）—— p.36 (`L4239-4269`)
  - 环境准备：CANN 安装 + `source ${install_path}/set_env.sh` —— p.38 (`L4599-4617`)
  - Add 算子三步流程：算子分析→核函数开发→运行验证 —— p.40 (`L4549-4565`)
  - Add 设计规格表：OpType=AddCustom，x/y/z shape=(8,2048) float ND —— p.42 (`L4709-4747`)
  - 所需接口：DataCopy / Add / AllocTensor·FreeTensor / EnQue·DeQue —— p.42 (`L4669-4704`)
  - 核函数限定符：`__global__ __aicore__ void add_custom(GM_ADDR x, GM_ADDR y, GM_ADDR z, ...)` —— p.43 (`L4836, L4849`)
  - HelloWorld：`__global__ __vector__ void hello_world()` + `hello_world<<<blockDim, nullptr, stream>>>()` —— p.38 (`L4440, L4463`)

---

## 2. 目标目录结构（落地到 src/mvp）

```text
src/mvp/                       # Vite + React + TS 项目根
  index.html
  package.json
  vite.config.ts
  tailwind.config.ts           # npu-fantasy 暗色调色板
  tsconfig.json
  components.json              # shadcn 配置
  src/
    main.tsx
    App.tsx                    # 顶层 view 状态机 + 布局壳
    index.css                  # Tailwind + 暗色 CSS 变量
    types/
      content.ts               # Quest / Challenge / SourceRef / Badge 类型
      events.ts                # LearningEvent / LearningStats 类型
    data/
      content-pack.json        # 文档包元信息（packId/theme/totalPages）
      quests.json              # 6 个关卡（含 Boss）
      challenges.json          # 全部题目（PDF 精准取材）
      badges.json              # 通关徽章定义
      source-chunks.json       # 原文溯源片段（章/页/标签）
    lib/
      content.ts               # loadQuests/loadChallenges/按 id 查找
      scoring.ts               # judgeAnswer(各题型) + XP 计算
      events.ts                # appendEvent / readEvents / clearEvents（localStorage）
      analytics.ts             # deriveStats: XP/progress/accuracy/weakTags/review
      unlock.ts                # 关卡解锁判定（顺序 + 完成前置）
      storage-keys.ts          # 集中常量
    store/
      useGameStore.ts          # Zustand: view/activeQuestId/lastResult/refresh tick
    components/
      layout/
        TopBar.tsx             # 品牌 + XP/Level/进度 + 复位
        AppShell.tsx           # 暗色全幅背景 + 内容容器
      map/
        GameMap.tsx            # 5+1 关卡节点路径（横/纵）
        QuestNode.tsx          # 锁定/进行中/已完成态
      quest/
        QuestScreen.tsx        # 关卡页骨架：剧情+卡片+题目+导航
        KnowledgeCard.tsx      # 知识卡（≤120字）
        ChallengeRenderer.tsx  # 按 type 分发
        ChallengeHeader.tsx    # 题号/XP/标签
        FeedbackPanel.tsx      # 正确/错误 + 解释 + 原文引用 + 复习链接
        HintButton.tsx         # 提示（写 hint_requested 事件）
      challenges/
        SingleChoice.tsx
        MultiChoice.tsx
        Matching.tsx
        Ordering.tsx
        CodeBlank.tsx
        BossComposite.tsx      # 多子题聚合 + 总分 + 徽章
      dashboard/
        DashboardScreen.tsx
        ProgressOverview.tsx   # 进度环 + 总 XP + Level
        WeakTagList.tsx        # Top3 薄弱标签（wrong*2 + hint）
        QuestHistory.tsx       # 各关完成/正确率/耗时
        ReviewSuggestions.tsx  # 推荐复习关卡
        BadgePanel.tsx         # 已获徽章
      landing/
        HeroSection.tsx        # 全幅视觉锚点（2517页 → 5关 主张）
        PdfUploadStub.tsx      # 伪上传入口（未来扩展提示）
      ui/                      # shadcn 预装组件（button/card/dialog/...）
    views/
      LandingView.tsx
      QuestView.tsx
      BossView.tsx
      DashboardView.tsx
  bundle.html                  # bundle-artifact.sh 产物（单文件交付）
```

---

## 3. 数据 Schema（落地 TypeScript 类型）

> 完全对齐技术架构文档第 4-5 节，便于未来迁移到 Postgres / xAPI。

### 3.1 `types/content.ts`

```ts
export type ChallengeType =
  | 'single_choice' | 'multi_choice'
  | 'matching' | 'ordering' | 'code_blank'
  | 'boss_composite';

export type SourceRef = {
  doc: string;
  chapter: string;
  page: number;
};

export type Challenge = {
  id: string;
  type: ChallengeType;
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer: unknown;        // string | string[] | Record<string,string> | string[](顺序) | code 填空映射
  pairs?: { left: string; right: string }[];   // matching 选项（已打乱）
  items?: string[];                            // ordering 选项（已打乱）
  blanks?: { id: string; answer: string }[];   // code_blank
  subChallenges?: string[];                    // boss 引用子题 id
  explanation: string;
  hint?: string;
  tags: string[];
  xp: number;
  sourceRefs?: SourceRef[];
};

export type KnowledgeCard = { title: string; body: string };

export type Quest = {
  id: string;
  order: number;                 // 0..5
  title: string;
  subtitle: string;
  story: string;
  learningObjectives: string[];
  cards: KnowledgeCard[];
  challengeIds: string[];
  unlockAfter: string[];         // 前置关卡 id
  rewardXp: number;
  badgeId: string | null;
  isBoss?: boolean;
};

export type Badge = { id: string; name: string; description: string };

export type ContentPack = {
  packId: string;
  title: string;
  sourceDoc: string;
  sourceVersion: string;
  totalPages: number;
  theme: 'npu-fantasy';
  estimatedMinutes: number;
};
```

### 3.2 `types/events.ts`

```ts
export type EventType =
  | 'quest_started' | 'challenge_submitted'
  | 'hint_requested' | 'quest_completed'
  | 'boss_completed' | 'review_started';

export type LearningEvent = {
  id: string;
  userId: string;
  sessionId: string;
  eventType: EventType;
  questId?: string;
  challengeId?: string;
  result?: 'correct' | 'wrong' | 'partial';
  score?: number;
  xpDelta?: number;
  tags?: string[];
  selectedAnswer?: unknown;
  correctAnswer?: unknown;
  timeSpentSec?: number;
  createdAt: string;
};

export type LearningStats = {
  totalXp: number;
  level: number;                 // 每 150 XP 一级（可调）
  completedQuestIds: string[];
  progressRatio: number;         // completed / total
  accuracy: number;              // correct / submitted
  weakTags: { tag: string; wrongCount: number; hintCount: number; score: number }[];
  reviewSuggestions: { questId: string; reason: string }[];
  badges: string[];
};
```

---

## 4. 关卡内容（PDF 精准取材，6 关）

> `quests.json` 与 `challenges.json` 落地内容。题数满足"≥3 种题型"+"Boss 综合题"。
> 所有 sourceRefs 页码已对照 PDF markdown 核验。

### 关卡 0 · 新手村入口 —— 2517 页文档讲什么？（doc_structure）
- 卡片：文档四大块——入门教程/编程指南/算子实践参考/API 参考（PDF 目录 p.35-38）
- 题型：**matching** 章节↔功能配对
- sourceRefs：入门教程(p.35)、编程指南(p.50)、算子实践参考(p.295)、API 参考(p.562)
- 通关：配对正确 ≥3/4

### 关卡 1 · 认识 Ascend C（ascend_c_intro / api_layers）
- 卡片1：Ascend C 是 CANN 面向算子开发的编程语言，原生支持 C/C++，运行在昇腾 AI 处理器（PDF L4242-4246）
- 卡片2：四层 API——基础 API/高阶 API/算子模板库/Python 前端(PyAsc)（PDF L4253-4269）
- 题型：**single_choice**（主要用途选 B）+ **multi_choice**（哪些是 Ascend C 提供的 API 层级）
- sourceRefs：p.36

### 关卡 2 · 环境准备装备栏（environment / cann / cmake）
- 卡片：开发前需 CANN 软件安装 + `source ${install_path}/set_env.sh` 配置环境变量（PDF L4604-4617）
- 题型：**multi_choice**（必要项：安装 CANN、set_env.sh、满足要求的 CMake；干扰项：Photoshop）
- sourceRefs：p.38
- 通关：选中全部必要项且不选 Photoshop

### 关卡 3 · HelloWorld 洞穴（kernel_launch / acl_runtime / stream）
- 卡片1：核函数用 `__global__ __vector__` 限定（PDF L4440）
- 卡片2：Host 侧 `<<<blockDim, nullptr, stream>>>` 调用 + `aclrtSynchronizeStream`（PDF L4463）
- 题型：**ordering** 排序 ACL 调用链：aclInit → aclrtSetDevice → aclrtCreateStream → hello_world<<<>>> → aclrtSynchronizeStream → 释放资源
- sourceRefs：p.38

### 关卡 4 · Add 算子地下城（add_custom / datacopy / vector_add / queue / tensor）
- 卡片1：Add 算子三步——算子分析→核函数开发→运行验证（PDF L4555-4565）
- 卡片2：设计规格 AddCustom，x/y/z shape=(8,2048) float ND（PDF 表1-1 L4709-4747）
- 题型：**matching** API↔用途（DataCopy=GM↔Local 搬运 / Add=矢量加法 / AllocTensor·FreeTensor=Tensor 申请释放 / EnQue·DeQue=队列同步）（PDF L4669-4704）+ **ordering** 单核流水线 CopyIn→Compute→CopyOut（PDF L4874-4878）
- sourceRefs：p.40-43
- 通关：配对 ≥80%

### 关卡 5 · Boss 战 —— 你能描述一个 Add 算子吗？（boss_add_operator）
子题（boss_composite 聚合，总分 100，≥80 发徽章 "Add 算子见习开发者"）：
1. **multi_choice** 选 Add 输入输出：x、y、z（PDF L4642）
2. **single_choice** 选 shape 与类型：(8,2048)/float/ND（表1-1）
3. **ordering** 单核流水线 CopyIn→Compute→CopyOut
4. **multi_choice** 选实现接口：DataCopy、Add、AllocTensor、FreeTensor、EnQue、DeQue（PDF L4669-4704）
5. **code_blank** 填核函数限定符：`__global__` + `__aicore__` + `void add_custom(...)`（PDF L4836/4849）
- sourceRefs：p.42-43

### badges.json
- `badge_add_journeyman`：Add 算子见习开发者 —— Boss 战 ≥80 分获得

### source-chunks.json
为每关关联 chunk（chunkId/docId/chapter/pageStart/pageEnd/text/tags），用于 P1 原文引用展示与未来 RAG。MVP 手写 ~8 条，覆盖上述章节。

---

## 5. 核心模块实现要点

### 5.1 `lib/scoring.ts` —— 判分核心
- `judgeAnswer(challenge, userAnswer): { result, score, xp }`
- single_choice：相等即 correct（xp=challenge.xp）
- multi_choice：集合相等 correct；部分对 partial（按比例给 xp）；含干扰项错选判 wrong
- matching：左→右映射全对 correct，按对数比例 partial
- ordering：序列全对 correct，否则 wrong（不做部分分，强调流程严谨）
- code_blank：逐 blank 比对（trim + 大小写可配置）
- boss_composite：聚合子题 result，总分 = 各子题得分和，阈值 ≥80 发徽章
- XP 累计由 analytics 从事件流重算（事件为唯一真相源）

### 5.2 `lib/events.ts` —— 事件存储
- `STORAGE_KEY = 'study-by-gaming:events'`，`USER_ID='demo_user'`，`SESSION_ID=uuid 一次会话一份`
- `appendEvent(partial)`：自动补 id/userId/sessionId/createdAt，写入 localStorage
- `readEvents()`：JSON parse + 容错
- `clearEvents()`：Demo 复位用

### 5.3 `lib/analytics.ts` —— 派生统计
- 遍历 events：
  - `totalXp` = Σ `xpDelta`（仅 correct/partial 计正分）
  - `completedQuestIds` = 出现 `quest_completed`/`boss_completed` 的 quest
  - `progressRatio` = completed / 6
  - `accuracy` = correct 提交 / 总提交
  - weakTags：按 tag 聚合 `wrong_count*2 + hint_count`，降序取 Top3
  - reviewSuggestions：薄弱 tag 命中的 quest，去重推荐
  - badges：boss_completed 且 score≥80 → 加入对应 badgeId

### 5.4 `lib/unlock.ts`
- `isUnlocked(quest, completedIds)`：`unlockAfter` 全部 ∈ completedIds
- 顺序锁：默认前序关卡完成才解锁下一关（Boss 需关卡 4 完成）

### 5.5 `store/useGameStore.ts`（Zustand）
- state：`view: 'landing'|'quest'|'boss'|'dashboard'`、`activeQuestId`、`lastResult`、`tick`（强制重算）
- actions：`goLanding/goQuest(id)/goBoss/goDashboard`、`submit(...)`（内部调 scoring+events+tick++）、`resetProgress`

### 5.6 App.tsx view 状态机
- 读 store.view 渲染 LandingView / QuestView / BossView / DashboardView
- TopBar 常驻：品牌 + XP + Level + 进度 + 重置 + 跳仪表盘
- 用 Framer Motion `AnimatePresence` 做切换淡入

---

## 6. 视觉与交互设计（frontend-skill 落实）

**Visual Thesis**：暗色 NPU 机房幻想——深蓝黑底 + 单一青/紫强调色发光，像 RPG 世界地图，品牌名「Study by Gaming」最响。

**Content Plan**：Hero（2517页→5关 主张 + CTA「进入新手村」）→ Support（学习地图 + 当前进度）→ Detail（关卡页知识卡 + 挑战）→ Final CTA（Boss 战 / 仪表盘）。

**Interaction Thesis**：
1. Hero 入场：标题/CTA 依次淡入上浮 + 背景粒子/网格缓动
2. 关卡解锁：scroll-linked 路径点亮 + 节点 scale 弹入
3. 答题反馈：correct 掉金币 + XP 数字滚动；wrong 抖动 + 解释展开

**落实要点**：
- 全幅 Hero（无 max-width 外框），仅内层文字列窄居中
- 品牌「Study by Gaming」为最大字号；副标题"把 2517 页技术文档变成 5 分钟一关的学习游戏"
- 两套字体：display（如 Geist/Sora）+ mono（代码/填空题）
- 单一强调色（npu 青 `#22d3ee` 系），暗色 `--background`/`--foreground` CSS 变量
- 关卡地图用路径连接节点而非卡片网格；知识卡限制 ≤120 字
- XP/进度用 Framer Motion 数字滚动；错误用解释面板而非弹窗骚扰
- 全部交互有 hover/active 反馈；移动端可读但非适配重点

---

## 7. 实现步骤顺序（建议落地序列）

> 对齐技术架构第 14 节「最小代码落地顺序」。每步可独立验证。

1. **初始化工程**：用 web-artifacts-builder 的 `scripts/init-artifact.sh` 在 `src/mvp` 生成 Vite+React+TS+Tailwind+shadcn 骨架；装 framer-motion、zustand。
2. **配 npu-fantasy 暗色主题**：`tailwind.config.ts` + `index.css` CSS 变量 + 字体。
3. **写数据**：`content-pack.json`/`quests.json`/`challenges.json`/`badges.json`/`source-chunks.json`（按第 4 节 PDF 取材）。
4. **类型 + lib**：`types/*` + `lib/content.ts`/`scoring.ts`/`events.ts`/`analytics.ts`/`unlock.ts`。
5. **store**：`useGameStore.ts`。
6. **Challenge 组件**：先 SingleChoice + Matching + Ordering（P0 三种），再 CodeBlank、MultiChoice、BossComposite。
7. **ChallengeRenderer + FeedbackPanel + HintButton**。
8. **QuestScreen + KnowledgeCard + 关卡页骨架**。
9. **GameMap + QuestNode + LandingView（全幅 Hero）**。
10. **DashboardScreen 四件套 + BadgePanel**。
11. **BossView + 徽章颁发逻辑**。
12. **App.tsx view 状态机 + TopBar + AppShell + Framer Motion 切换**。
13. **联调**：首页→关卡→答题→反馈→仪表盘→Boss 全链路；localStorage 刷新验证。
14. **打磨**：演示数据预置（一键填充示例进度）、伪上传入口、原文引用展示。
15. **打包**：`scripts/bundle-artifact.sh` 生成 `bundle.html` 单文件交付。

---

## 8. 验收清单（对齐需求文档第 11 节）

**通过标准（全部 ✓）**：
- [ ] 首页展示 6 关卡地图，锁定/已完成态正确，可进入未完成关
- [ ] 至少 3 种题型（single_choice/matching/ordering）可答题并反馈
- [ ] 答对 +XP、答错显示解释 + 原文引用 + 复习链接
- [ ] 提示按钮点击后展示大白话解释并记 hint 事件
- [ ] localStorage 记录 challenge_submitted/quest_completed/hint_requested，刷新不丢
- [ ] 仪表盘展示 总XP/Level/进度/正确率/Top3 薄弱标签/推荐复习/徽章
- [ ] Boss 战可完成，≥80 分发"Add 算子见习开发者"徽章
- [ ] 暗色 npu-fantasy 视觉：全幅 Hero、品牌最响、单一强调色、关卡路径
- [ ] 至少 2-3 处 Framer Motion 动效（hero 入场/解锁/反馈）
- [ ] `bundle.html` 单文件可离线打开运行

**失败红线（必须避免）**：
- 只有静态页无答题交互
- 只有 quiz 无学习记录/仪表盘
- 只有聊天无关卡路径
- 依赖实时 LLM 导致演示不稳

---

## 9. 黑客松演示脚本（7 步，~3 分钟）

1. **痛点**：展示《Ascend C 算子开发指南》2517 页，"看不出先学什么"。
2. **主张**：打开 Study by Gaming → 全幅 Hero「2517 页 → 5 关」，CTA「进入新手村」。
3. **地图**：6 关路径，当前 XP/Level/进度实时可见。
4. **关卡 4 演示**：进入 Add 地下城 → 知识卡 → API 配对题，答对 +XP 动效。
5. **故意答错**：展示解释面板 + 原文引用（p.42）+ 该 tag 进入薄弱点。
6. **Boss 战**：完成 5 子题，≥80 分 → 颁发"Add 算子见习开发者"徽章。
7. **仪表盘**：展示进度/正确率/Top3 薄弱点/推荐复习；收尾说明后续接 PDF 自动解析 + RAG + xAPI。

---

## 10. 假设与风险

**假设**：
- 用户接受 demo_user 单用户、localStorage 持久化（无账号）。
- 暗色 npu-fantasy 风格可由 frontend-skill 指导下的 Tailwind + shadcn 落地，无需外部设计稿。
- web-artifacts-builder 的 init/bundle 脚本可用且兼容 Node 18+。

**风险与规避**：
- 题目判分边界多 → scoring 集中实现 + 关键题型写最小单测。
- 刷新丢数据 → 所有派生状态从 events 重算，events 为唯一真相。
- 视觉做不完 → 优先 Hero + 地图 + 反馈三处动效，其余用静态精致排版兜底。
- bundle 失败 → 预留 `npm run dev` 本地演示作 fallback。

---

## 11. 范围外（明确不做）
Next.js / 后端 / 数据库 / 实时 LLM / 真实 Ascend 编译运行 / 多人账号排行榜 / xAPI 完整接入 / 完整 PDF 自动解析 / 移动端深度适配。这些进入 v0.2+ 演进路线（见架构文档第 17 节）。
