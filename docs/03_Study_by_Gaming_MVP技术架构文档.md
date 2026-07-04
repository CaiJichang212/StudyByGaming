# Study by Gaming MVP 技术架构文档

生成日期：2026-07-04  
版本：MVP v0.1  
目标：3 小时黑客松可实现、可演示、可扩展

---

## 1. 架构原则

### 1.1 Demo 优先

MVP 的核心目标是稳定演示学习闭环，不是一次性做完 PDF 解析、RAG、LMS、游戏引擎。

优先级：

```text
稳定可演示 > 学习闭环完整 > 数据可记录 > 视觉像游戏 > 自动化程度高
```

### 1.2 内容预生成，交互实时化

MVP 采用预生成 `quests.json`，避免在演示现场实时解析 2517 页 PDF 和调用 LLM。

```text
离线：PDF -> 人工/LLM 辅助整理 -> quests.json
在线：quests.json -> 游戏关卡 -> 用户交互 -> 学习事件记录
```

### 1.3 数据模型保留长期扩展能力

即使 MVP 用 localStorage，也应按事件模型设计，便于后续迁移到数据库、xAPI 或 LRS。

---

## 2. 推荐技术栈

### 2.1 首选方案：Next.js 单体 Web 应用

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | Next.js + React + TypeScript | 快速做页面和交互组件 |
| 样式 | Tailwind CSS | 快速做游戏化卡片、地图、徽章 |
| 状态 | Zustand 或 React Context | 管理当前关卡、XP、事件 |
| 数据存储 | localStorage | 3 小时 MVP 最稳，不依赖后端 |
| 内容 | `quests.json` | 预置关卡内容 |
| 图表 | Recharts 或简单 CSS | 仪表盘展示进度和薄弱点 |
| 动画 | Framer Motion 可选 | 非必要，最后再加 |

优点：启动快、部署快、演示稳定。  
缺点：后端能力弱，但 MVP 足够。

### 2.2 备选方案：FastAPI + Next.js

如果团队有后端同学，可以拆成：

| 层 | 技术 |
|---|---|
| 前端 | Next.js |
| 后端 | FastAPI |
| DB | SQLite |
| 内容生成 | Python 脚本 + PyMuPDF |
| RAG 可选 | LangChain + Chroma/FAISS |

优点：更接近长期架构。  
缺点：3 小时联调风险更高。

### 2.3 不推荐方案

- 不建议直接上 Moodle/Open edX：太重，无法 3 小时完成产品体验。
- 不建议直接上 Phaser：游戏表现强，但表单、数据、学习仪表盘开发会变慢。
- 不建议强依赖实时 LLM：黑客松网络、额度、响应时间都有风险。

---

## 3. MVP 总体架构

```text
┌────────────────────────────────────────────────────────┐
│                    Study by Gaming Web                 │
│                                                        │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ Landing Map │ → │ Quest Engine │ → │ Boss Battle │ │
│  └─────────────┘   └──────────────┘   └─────────────┘ │
│          ↓                ↓                  ↓         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Learning Event Store                │  │
│  │      localStorage / SQLite compatible events     │  │
│  └──────────────────────────────────────────────────┘  │
│          ↓                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Learning Analytics Dashboard         │  │
│  │ progress / XP / weak tags / review suggestions    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Static content: quests.json + source_chunks.json       │
└────────────────────────────────────────────────────────┘
```

---

## 4. 模块设计

### 4.1 Content Pack 模块

MVP 用静态 JSON 表示一个“文档游戏包”。

文件结构：

```text
/data
  ├─ content-pack.json
  ├─ quests.json
  ├─ source-chunks.json
  └─ badges.json
```

`content-pack.json` 示例：

```json
{
  "packId": "ascend-c-operator-guide-850",
  "title": "Ascend C 算子开发指南新手村",
  "sourceDoc": "CANN 社区版 8.5.0 Ascend C 算子开发指南",
  "sourceVersion": "8.5.0 / 文档版本 01 / 2026-03-06",
  "totalPages": 2517,
  "theme": "npu-fantasy",
  "estimatedMinutes": 25
}
```

### 4.2 Quest Engine 模块

Quest Engine 负责读取 quest、渲染题目、判断答案、发事件。

核心职责：

1. 加载当前关卡。
2. 展示知识卡片。
3. 渲染 challenge 组件。
4. 校验答案。
5. 生成反馈。
6. 派发学习事件。
7. 更新 XP、进度、徽章。

### 4.3 Challenge 组件

MVP 至少实现 3 种：

```text
MultipleChoiceChallenge
MatchingChallenge
OrderingChallenge
```

可选：

```text
CodeBlankChallenge
BossCompositeChallenge
```

统一接口：

```ts
export type Challenge = {
  id: string;
  type: 'single_choice' | 'multi_choice' | 'matching' | 'ordering' | 'code_blank';
  title: string;
  prompt: string;
  options?: string[];
  pairs?: { left: string; right: string }[];
  correctAnswer: unknown;
  explanation: string;
  tags: string[];
  xp: number;
  sourceRefs?: SourceRef[];
};
```

### 4.4 Learning Event Store 模块

MVP 可直接 localStorage：

```ts
const STORAGE_KEY = 'study-by-gaming-events';
```

事件类型：

```ts
export type LearningEvent = {
  id: string;
  userId: string;
  sessionId: string;
  eventType:
    | 'quest_started'
    | 'challenge_submitted'
    | 'hint_requested'
    | 'quest_completed'
    | 'boss_completed'
    | 'review_started';
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
```

事件记录函数：

```ts
export function appendEvent(event: LearningEvent) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const events = raw ? JSON.parse(raw) : [];
  events.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
```

### 4.5 Learning Analytics 模块

从事件流计算派生状态：

```ts
export type LearningStats = {
  totalXp: number;
  completedQuestIds: string[];
  progressRatio: number;
  accuracy: number;
  weakTags: { tag: string; wrongCount: number; hintCount: number }[];
  reviewSuggestions: { questId: string; reason: string }[];
  badges: string[];
};
```

薄弱点计算逻辑：

```text
weak_score(tag) = wrong_count(tag) * 2 + hint_count(tag) + avg_time_penalty(tag)
```

MVP 可以只用：

```text
weak_score(tag) = wrong_count(tag) * 2 + hint_count(tag)
```

---

## 5. 数据 Schema

### 5.1 Quest Schema

```json
{
  "id": "quest_add_dungeon",
  "order": 4,
  "title": "Add 算子地下城",
  "story": "你需要帮助 NPU 把 x 和 y 从 Global Memory 搬到 Local Memory，并完成加法。",
  "learningObjectives": [
    "理解 Add 自定义算子的输入输出规格",
    "理解 CopyIn -> Compute -> CopyOut 流水线",
    "识别 DataCopy、Add、TQue 等接口作用"
  ],
  "cards": [
    {
      "title": "DataCopy 是搬运技能",
      "body": "DataCopy 负责 Global Memory 与 Local Memory 之间的数据搬运。"
    }
  ],
  "challenges": ["challenge_add_api_match", "challenge_add_pipeline_order"],
  "unlockAfter": ["quest_hello_world"],
  "rewardXp": 100,
  "badgeId": null
}
```

### 5.2 Challenge Schema

```json
{
  "id": "challenge_add_api_match",
  "type": "matching",
  "title": "API 装备配对",
  "prompt": "把 Ascend C API 和用途配对。",
  "items": [
    { "left": "DataCopy", "right": "GM 与 Local Memory 数据搬运" },
    { "left": "Add", "right": "矢量加法计算" },
    { "left": "AllocTensor / FreeTensor", "right": "Tensor 申请和释放" },
    { "left": "EnQue / DeQue", "right": "Queue 队列管理" }
  ],
  "correctAnswer": {
    "DataCopy": "GM 与 Local Memory 数据搬运",
    "Add": "矢量加法计算",
    "AllocTensor / FreeTensor": "Tensor 申请和释放",
    "EnQue / DeQue": "Queue 队列管理"
  },
  "explanation": "Add 算子的核心是先搬入，再计算，再搬出；队列和 Tensor 管理用于组织流水并行。",
  "tags": ["datacopy", "vector_add", "queue", "tensor"],
  "xp": 50,
  "sourceRefs": [
    {
      "doc": "Ascend C 算子开发指南",
      "chapter": "1.3.2 Add 自定义算子开发",
      "page": 40
    }
  ]
}
```

### 5.3 Source Chunk Schema

用于未来 RAG 和原文溯源。MVP 可手写。

```json
{
  "chunkId": "ascendc_add_intro_001",
  "docId": "ascend-c-guide-850",
  "chapter": "1.3.2 Add 自定义算子开发",
  "pageStart": 40,
  "pageEnd": 43,
  "text": "Add 算子开发包括算子分析、核函数开发、核函数运行验证。",
  "tags": ["add_custom", "operator_flow"]
}
```

---

## 6. 页面与组件架构

```text
app/
  page.tsx                         # 首页学习地图
  quest/[questId]/page.tsx          # 关卡页
  boss/page.tsx                     # Boss 战
  dashboard/page.tsx                # 学习仪表盘

components/
  GameMap.tsx
  QuestCard.tsx
  KnowledgeCard.tsx
  XPBar.tsx
  BadgePanel.tsx
  ChallengeRenderer.tsx
  challenges/
    SingleChoice.tsx
    MultiChoice.tsx
    Matching.tsx
    Ordering.tsx
    CodeBlank.tsx
  DashboardStats.tsx
  WeakTagList.tsx

lib/
  content.ts                       # load quests/challenges
  scoring.ts                       # judge answer, calculate XP
  events.ts                        # append/read localStorage events
  analytics.ts                     # derive stats
  unlock.ts                        # quest unlock logic

data/
  content-pack.json
  quests.json
  challenges.json
  badges.json
  source-chunks.json
```

---

## 7. 核心流程

### 7.1 开始关卡流程

```text
用户点击关卡
  ↓
检查 unlock 条件
  ↓
记录 quest_started 事件
  ↓
渲染知识卡 + 第一题
```

### 7.2 提交答案流程

```text
用户提交答案
  ↓
ChallengeRenderer 调用 judgeAnswer
  ↓
返回 correct/partial/wrong + score
  ↓
appendEvent(challenge_submitted)
  ↓
更新 XP 和反馈
  ↓
如果本关全部完成，appendEvent(quest_completed)
```

### 7.3 请求提示流程

```text
用户点击提示
  ↓
展示 hint/explanation/sourceRef
  ↓
appendEvent(hint_requested)
  ↓
analytics 中该 tag 的 hint_count +1
```

### 7.4 仪表盘统计流程

```text
读取 events
  ↓
按 quest 聚合完成度
  ↓
按 challenge 聚合正确率
  ↓
按 tags 聚合 wrong_count / hint_count
  ↓
生成 weakTags 和 reviewSuggestions
```

---

## 8. 内容生成流程设计

### 8.1 MVP 手动/半自动生成

```text
PDF 目录和关键章节
  ↓
手动选 5 个学习目标
  ↓
用 LLM 辅助生成题目草稿
  ↓
人工校验答案和解释
  ↓
写入 quests.json/challenges.json
```

推荐提示词：

```text
你是技术教学设计师。请根据下面的 Ascend C 文档片段，生成一个游戏化学习关卡。
要求：
1. 只覆盖一个明确学习目标。
2. 生成 2 张知识卡，每张不超过 120 字。
3. 生成 1 道选择题、1 道排序题、1 道配对题。
4. 每道题必须给出正确答案、解释、知识点 tags、来源章节。
5. 不允许编造文档中没有的信息。
文档片段：
<<<DOC_CHUNK>>>
```

### 8.2 后续自动化生成

```text
PDF
  ↓ PyMuPDF / Marker
Markdown + TOC + page refs
  ↓ Section chunking
Chunk Store
  ↓ Concept extractor
Concept graph
  ↓ Quest generator
Quests / Challenges / Boss tasks
  ↓ Validator
引用检查 / 答案检查 / 难度检查
  ↓ Content Pack
```

### 8.3 生成质量校验器

长期版本必须加入校验：

| 校验项 | 方法 |
|---|---|
| 答案是否来自原文 | 每题必须带 sourceRefs |
| 是否覆盖学习目标 | challenge tags 必须命中 quest objectives |
| 是否难度递进 | easy -> medium -> boss |
| 是否题型单一 | 每关至少 2 种题型 |
| 是否解释过长 | 知识卡和解释限制字数 |
| 是否有幻觉 | RAG 证据不足时拒绝生成 |

---

## 9. 后端 API 设计（可选）

如果使用 Next.js API Routes 或 FastAPI，可设计如下接口。

### 9.1 内容接口

```http
GET /api/content-packs
GET /api/content-packs/:packId/quests
GET /api/quests/:questId
GET /api/challenges/:challengeId
```

### 9.2 学习事件接口

```http
POST /api/events
GET /api/events?userId=demo_user
GET /api/analytics?userId=demo_user&packId=ascend-c-operator-guide-850
```

### 9.3 未来生成接口

```http
POST /api/documents/upload
POST /api/documents/:docId/generate-content-pack
GET /api/documents/:docId/generation-status
POST /api/tutor/hint
```

MVP 不需要全部实现；前端 localStorage 足够。

---

## 10. 数据库设计（长期版）

如果迁移到 Postgres：

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT,
  version TEXT,
  source_file TEXT,
  total_pages INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id),
  title TEXT,
  order_index INTEGER,
  content JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  quest_id TEXT REFERENCES quests(id),
  type TEXT,
  content JSONB,
  correct_answer JSONB,
  tags TEXT[],
  source_refs JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE learning_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  event_type TEXT,
  quest_id TEXT,
  challenge_id TEXT,
  result TEXT,
  score NUMERIC,
  xp_delta INTEGER,
  tags TEXT[],
  payload JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

未来如果接 RAG：

```sql
CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id),
  chapter TEXT,
  page_start INTEGER,
  page_end INTEGER,
  text TEXT,
  tags TEXT[],
  embedding VECTOR
);
```

---

## 11. RAG 架构（赛后版本）

### 11.1 用途边界

RAG 不应直接决定所有题目的正确性。它适合做：

- 生成关卡草稿。
- AI 导师提示。
- 原文解释。
- 用户自由问答。
- 推荐复习内容。

关键题答案应结构化存储，并人工或规则校验。

### 11.2 检索策略

技术 PDF 推荐 hybrid retrieval：

```text
keyword search：API 名称、函数名、术语精确匹配
vector search：概念解释、类比、跨章节语义检索
reranker：优先同章节、同页码、代码块附近内容
```

### 11.3 Chunking 策略

| 内容类型 | 切分方法 |
|---|---|
| 章节正文 | 按标题层级切分，保留父标题 |
| 代码块 | 代码块作为独立 chunk，保留前后解释 |
| 表格 | 转成 Markdown table，附页码 |
| API 参考 | 每个 API 一个 chunk |
| FAQ | 每个问题一个 chunk |
| 图示 | 保存图题、上下文、可选 OCR 描述 |

---

## 12. 安全与隐私

MVP 使用本地存储即可，不涉及用户敏感数据。长期版本需要考虑：

1. 用户上传文档可能是企业内部资料，需要私有化部署选项。
2. 学习事件属于个人行为数据，应允许导出和删除。
3. 如果调用外部 LLM，应明确哪些内容会发送出去。
4. 生成题目必须避免泄露文档中不该展示的敏感内容。

---

## 13. 工程风险与规避

| 风险 | MVP 规避方式 | 长期解决方案 |
|---|---|---|
| PDF 解析慢 | 预置 JSON | 异步任务队列 + 缓存 |
| LLM 不稳定 | 不实时调用 | 生成后校验 + fallback 模板 |
| 答案误判 | 结构化答案 | 自动测试题目数据 |
| 交互做不完 | 只做 3 种题型 | 抽象 ChallengeRenderer |
| 数据丢失 | localStorage 简单持久化 | Postgres + 用户账号 |
| 游戏感不足 | 地图、XP、徽章、Boss 战 | Phaser/动画/剧情系统 |

---

## 14. 最小代码落地顺序

### Step 1：定义内容数据

先写 `quests.json` 和 `challenges.json`，不要先写 UI。

### Step 2：写通用 ChallengeRenderer

先支持选择题；再加排序题和配对题。

### Step 3：写事件记录

每次提交答案都能写入 localStorage。

### Step 4：写分析函数

从 events 派生 XP、progress、weakTags。

### Step 5：做首页地图和仪表盘

让数据变化可视化。

### Step 6：加 Boss 战和徽章

完成 Demo 闭环。

---

## 15. MVP 文件模板

### 15.1 `quests.json` 最小结构

```json
[
  {
    "id": "quest_intro",
    "order": 1,
    "title": "认识 Ascend C",
    "story": "欢迎来到 NPU 新手村。第一步，你要知道 Ascend C 是什么。",
    "cards": [
      {
        "title": "Ascend C 是什么",
        "body": "Ascend C 是 CANN 面向算子开发场景推出的编程语言，用于在昇腾 AI 处理器上实现自定义算子。"
      }
    ],
    "challengeIds": ["c_intro_1"],
    "rewardXp": 50
  }
]
```

### 15.2 `challenges.json` 最小结构

```json
[
  {
    "id": "c_intro_1",
    "type": "single_choice",
    "title": "Ascend C 的用途",
    "prompt": "Ascend C 主要用于什么？",
    "options": [
      "开发普通网页",
      "开发昇腾 AI 处理器上的自定义算子",
      "替代 Git 做版本管理",
      "制作 PPT"
    ],
    "correctAnswer": "开发昇腾 AI 处理器上的自定义算子",
    "explanation": "Ascend C 是 CANN 针对算子开发场景推出的编程语言。",
    "tags": ["ascend_c_intro"],
    "xp": 30
  }
]
```

---

## 16. 演示部署建议

最快部署方式：

```bash
npm run dev
```

如果需要公网演示：

```bash
npm run build
vercel deploy
```

如果网络不稳定，建议本地浏览器演示，所有内容预置，避免依赖外部 API。

---

## 17. 后续演进路线

### v0.2：内容生成自动化

- PDF 上传。
- 目录解析。
- 选定章节自动生成关卡草稿。
- 人工编辑题目。

### v0.3：AI 导师与 RAG

- 基于 source chunks 的引用回答。
- 根据错题标签解释概念。
- 支持“为什么我错了？”对话。

### v0.4：学习画像

- 长期用户账号。
- 知识点掌握度曲线。
- 自动生成复习计划。

### v1.0：技术文档训练营平台

- 多文档、多课程。
- 企业内部私有部署。
- 团队学习仪表盘。
- xAPI/LRS 标准接入。
- 代码沙箱和真实任务评测。

---

## 18. 最终推荐架构

本次黑客松最终推荐：

```text
Next.js + Tailwind + TypeScript
静态 quests.json/challenges.json
localStorage 学习事件记录
前端实时计算 analytics
不接实时 LLM
不接真实数据库
不做完整 PDF 解析
```

原因：3 小时内最稳、最容易展示、最能证明产品价值。

赛后长期推荐：

```text
Next.js 前端
FastAPI 内容生成服务
Postgres + pgvector
PyMuPDF/Marker PDF 解析
LangChain/LlamaIndex RAG
xAPI-like event store
可选 ADL LRS / Open edX / Moodle 集成
```

这条路线既能完成 MVP，也能自然扩展为真正的“技术文档游戏化学习平台”。
