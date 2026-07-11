# HyperFrames Tutorial Demos Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从两条本地教学视频各产出一个真实可渲染的 HyperFrames Demo：3D 海报墙与伪 3D 三角函数投影舱。

**Architecture:** 两个 Demo 完全独立。海报墙使用 DOM/CSS 3D + GSAP 分层编舞；投影舱使用独立 `projection.js` 的 Canvas 2D 纯函数几何 + `index.html` 中单一 GSAP 状态时间线。每个 Demo 保留脱敏学习摘要、关键帧、两轮评分与唯一 final，原视频/转录/私人素材留在被忽略的 `.learning/`。

**Tech Stack:** HyperFrames 0.7.49、HTML/CSS、GSAP 3.14.2、Canvas 2D、FFmpeg/ffprobe、ImageMagick（本地选图接触表）。

---

## Chunk 1: Demo 11 · 3D Poster Wall

### Task 1: 初始化工程与素材账本

**Files:**
- Create: `demos/11-hyperframes-3d-poster-wall/package.json`
- Create: `demos/11-hyperframes-3d-poster-wall/hyperframes.json`
- Create: `demos/11-hyperframes-3d-poster-wall/meta.json`
- Create: `demos/11-hyperframes-3d-poster-wall/README.md`
- Create: `demos/11-hyperframes-3d-poster-wall/LEARNING.md`
- Create: `demos/11-hyperframes-3d-poster-wall/assets/fixtures/poster-*.svg`
- Create (local ignored): `.learning/runs/<run-id>/...`
- Create (local ignored): `demos/11-hyperframes-3d-poster-wall/assets/local/poster-*.jpg`
- Create (local ignored): `.learning/runs/<run-id>/local-posters.json`

- [ ] **Step 1: 建立私有 run**

在仓库级 run 记录 `source-poster-tilt`、媒体 SHA-256、ffprobe、MLX-Whisper transcript 路径、关键帧时间表与当前 stage；每条教程事实含时间码/帧或代码证据 hash，不复制完整口播进公开目录。规划确认后再 bind 到 Demo 11。

- [ ] **Step 2: 按宽高比和构图筛选照片**

从授权的本机图片根生成候选接触表；选择 12–16 张，按海报布局裁成 2:3/3:4/方形三档。记录源尺寸、裁剪、主体安全区、色彩差异和选择理由。另生成并提交一套原创 SVG fixture；composition 用 `data-var-src` 以 fixture 为 fallback，本地 `--variables-file` 才覆盖私人照片。

- [ ] **Step 3: 写工程配置**

固定 HyperFrames 版本和 `dev/check/render` 脚本；meta ID 与目录一致。

- [ ] **Step 4: 写零基础 README 与学习摘要**

README 覆盖效果、依赖、补素材、check、snapshot、render 和常见问题。LEARNING 区分教程事实、视觉观察、代码事实、实现推断、本地决定与验收。

### Task 2: 构建静态 hero frame

**Files:**
- Create: `demos/11-hyperframes-3d-poster-wall/index.html`

- [ ] **Step 1: 写完整静态布局**

先不加 GSAP：暗色 full-bleed 背景、后退网格、camera、tilt-world、双行标题、16–20 张照片卡、CSS 黑胶、Most Watched 面板、前景元数据。关键元素在 1920×1080 安全区内，边缘海报有意出血需标注。

- [ ] **Step 2: 用 snapshot 验静态构图**

临时用完整 hero state 截图，确认两处焦点、元素密度、标题/唱片/面板层级、无意遮挡和照片裁切。

- [ ] **Step 3: 修静态问题**

只修布局、裁切、颜色或字号，不提前用动画掩盖问题。

### Task 3: 增加确定性时间线

**Files:**
- Modify: `demos/11-hyperframes-3d-poster-wall/index.html`

- [ ] **Step 1: 标题中心展开**

使用 mask + `scaleY`，0.55s 内完成，不用纯 opacity 淡入。

- [ ] **Step 2: 按方向分组入场**

顶部/左/右/底部显式 `fromTo()`；相邻 0.08–0.12s，单卡 0.45–0.75s。外层负责入场，内图负责 Ken Burns，避免同一元素 transform 冲突。

- [ ] **Step 3: 分层整体倾斜与巡航**

3.0s 起 tilt-world 到 X=20/Y=-10、1.3s；camera 从 3.8s 起独立 x/y/scale 巡航到 9.5s；末尾不渐隐。

- [ ] **Step 4: 注册单一 paused timeline**

同步构建并写入 `window.__timelines[compositionId]`，无随机、无无限 repeat、无独立 wallclock tween。

### Task 4: 静态与动态质量门

**Files:**
- Create (ignored): `demos/11-hyperframes-3d-poster-wall/snapshots/*`
- Create (ignored): `demos/11-hyperframes-3d-poster-wall/renders/poster-wall.mp4`
- Create (ignored): `.learning/runs/<run-id>/score-r1.json`
- Create (ignored): `.learning/runs/<run-id>/score-r2.json`

- [ ] **Step 1: 运行完整 check**

Run: `npm run check`

Expected: 0 lint error、0 validate error、0 layout error；装饰性对比提示必须有意且记录。

- [ ] **Step 2: 截关键帧**

Run:

```bash
npm exec -- hyperframes@0.7.49 snapshot --at 0.15,0.55,0.95,1.55,2.15,3.25,4.25,5.25,7.25,9.25
```

逐帧核对方向分组、标题机制、组装完成点与巡航。Demo 总长固定为 293 帧 / 9.7667s。

- [ ] **Step 3: 修到机械 must-pass 全绿**

测试、check、snapshot、fixture public-only smoke 与实现规格评审任一失败都先修；无法修则 blocked，不进入主观评分。public-only smoke 使用独立临时 Git index 导出“HEAD + 本任务公开候选文件”，明确排除 `.learning` 与 `assets/local`，在导出目录执行 `npm run check`、draft render 和 ffprobe，必须得到 293 帧 / 9.7667s。它发生在 R1 前，不使用真实 staged index，也不依赖作者机器的 ignored 文件。

- [ ] **Step 4: 渲染 draft 并做 R1**

完整解码 MP4，保存 framemd5、全时长 6fps 顺序 watch sheets 和关键过渡高密度帧。独立 Reviewer 只看源证据、spec、check、这些连续观看证据与 MP4，记录 `reviewed_render_sha256`、完整观看状态、问题时间码、分数和一个主观 top_fix。

- [ ] **Step 5: 只修 top_fix，渲染 high 候选并做 R2**

冻结其他已正确维度；直接用 high 质量重新渲染得到新 hash，重新完整解码/连续审阅，禁止复用 R1 接触表结论。第二轮后停止，保留 residual。

- [ ] **Step 6: 固化 R2 已审阅候选为 final 并 ffprobe**

Run:

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of json renders/poster-wall.mp4
```

Expected: 不再调用 render；R2 的 `reviewed_render_sha256`、`final.json.render_sha256` 与现有 MP4 的 fresh SHA-256 三者相同。文件非空、1920×1080、30fps、293 帧 / 9.7667s，误差不超过一帧。

## Chunk 2: Demo 12 · Trig Projection Room

### Task 5: 初始化工程与数学规格

**Files:**
- Create: `demos/12-hyperframes-trig-projection-room/package.json`
- Create: `demos/12-hyperframes-trig-projection-room/hyperframes.json`
- Create: `demos/12-hyperframes-trig-projection-room/meta.json`
- Create: `demos/12-hyperframes-trig-projection-room/README.md`
- Create: `demos/12-hyperframes-trig-projection-room/LEARNING.md`
- Create (ignored): `.learning/runs/<run-id>/...`

- [ ] **Step 1: 保存源证据与选择决定**

记录 `source-data-motion`、媒体 SHA-256、五段教程范围、选择伪 3D 三面投影的原因、源关键帧、教程事实与实现推断；每条核心结论含时间码和证据 hash。规划确认后 bind 到 Demo 12。

- [ ] **Step 2: 锁定数学关系**

写清共享坐标、透视投影、单位圆点、后墙正弦、地面余弦和单相位 SSOT；LEARNING 不允许把 Three.js 写成实现。

- [ ] **Step 3: 写工程与文档骨架**

固定版本；README 解释 Canvas 2D 伪 3D 与真正 Three.js 的区别、运行与验收。

### Task 6: 构建静态投影舱与纯函数绘制

**Files:**
- Create: `demos/12-hyperframes-trig-projection-room/index.html`
- Create: `demos/12-hyperframes-trig-projection-room/projection.js`
- Create: `demos/12-hyperframes-trig-projection-room/projection.test.mjs`

- [ ] **Step 1: 写静态 DOM 层**

full-bleed 深色背景、左侧公式/读数、顶部阶段导航、Canvas 主区域、图例、注册角标和进度条。

- [ ] **Step 2: 先写数学失败测试**

测试 `theta=0/π/2/π/3π/2/2π` 的单位圆、sin/cos 分量、2π 首尾闭合，以及相同 state 两次求值深相等。

Run: `node --test projection.test.mjs`

Expected: RED，原因是 `projection.js` 尚不存在。

- [ ] **Step 3: 写 `project()` 与相位纯函数**

固定 camera constants，将逻辑 3D 点投影为屏幕 x/y/scale；禁止 DOM 测量和随机数。

- [ ] **Step 4: 验证数学 GREEN**

Run: `node --test projection.test.mjs`

Expected: 全部 PASS。

- [ ] **Step 5: 写 `drawFrame(state)`**

从 state 计算房间三面、网格、单位圆、圆点、投影线、已揭示的正弦/余弦采样与发光。相同 phase 必须产生相同像素状态。

- [ ] **Step 6: 截静态 hero frame**

用固定 phase 检查三面交界、曲线对应关系、标签可读性和无溢出。

### Task 7: 增加单相位动画

**Files:**
- Modify: `demos/12-hyperframes-trig-projection-room/index.html`

- [ ] **Step 1: 建立 state 与单 paused timeline**

只 tween 数值 state，并在 onUpdate 调用 `drawFrame()`；不手写互不相关的 SVG/Bezier 曲线。

- [ ] **Step 2: 编排五阶段**

construct 0–1.2s、map 1.2–2.4s、hold 2.4–3.0s、trace 3.0–9.0s、resolve 9.0–11.0s；DOM 元数据与 Canvas state 同步。主相位 `ease:none`。

- [ ] **Step 3: 增加有限 ambient motion**

扫描线/光晕必须附着同一 timeline；无无限 CSS/GSAP 动画。

### Task 8: 质量门与 render

**Files:**
- Create (ignored): `demos/12-hyperframes-trig-projection-room/snapshots/*`
- Create (ignored): `demos/12-hyperframes-trig-projection-room/renders/trig-room.mp4`
- Create (ignored): `.learning/runs/<run-id>/score-*.json`

- [ ] **Step 1: 运行完整 check**

Run: `npm run check`

Expected: package script 先执行 `node --test projection.test.mjs`，再执行 HyperFrames lint/validate/inspect；全部 0 errors。

- [ ] **Step 2: 截关键帧并核对数据同步**

Run:

```bash
npm exec -- hyperframes@0.7.49 snapshot --at 1.2,2.4,3.0,4.5,6.0,7.5,9.0,10.2
```

每帧核对圆点、波形、投影线、相位读数来自同一 state。

- [ ] **Step 3: 修到机械 must-pass 全绿**

数学测试、check、snapshot、实现规格评审与 fixture public-only smoke 失败先修或 blocked。public-only smoke 使用独立临时 Git index 导出“HEAD + 本任务公开候选文件”，明确排除 `.learning` 与本地素材，在导出目录执行 `npm run check`、draft render 和 ffprobe，必须得到 330 帧 / 11.0s；完成前不得进入 R1。

- [ ] **Step 4: draft -> 连续观看 R1 -> 单一 top_fix -> high 候选连续观看 R2**

每轮完整解码、framemd5、全时长 6fps watch sheets 和关键段密集帧；记录 render hash 与问题时间码。R2 直接审阅修正后的 high 候选，第二轮后停止。

- [ ] **Step 5: 固化 R2 候选为 final 并 ffprobe**

Expected: 不再重新渲染；R2 hash、final 指针与现有文件 hash 相同。文件非空、1920×1080、30fps、330 帧 / 11.0s。

## Chunk 3: 集成与交付

### Task 9: 更新仓库索引与隐私规则

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `README_CN.md`
- Modify: `demos/README.md`
- Modify: `docs/roadmap.md`

- [ ] **Step 1: 增加忽略规则**

忽略仓库级 `.learning/runs/`、Demo 11 的 `assets/local/`、renders、snapshots；允许 fixture、README/LEARNING/HTML/配置进入 Git。

- [ ] **Step 2: 更新三处 Demo 索引**

写清 11 为 CSS 3D 组装+巡航，12 为 Canvas 共享相位投影；状态只在 check/render 完成后标 ✅。

- [ ] **Step 3: 更新路线图**

增加 11/12 已完成；把 3D 地图、连续时间尺、排名竞速、挤出式 3D 环形图作为后续独立候选，不承诺已实现。

### Task 10: 全仓只读验收、最终审计与提交

**Files:**
- Test: all task files

- [ ] **Step 1: 两 Demo fresh check**

分别运行 `npm run check` 并保存退出码与完整输出。

- [ ] **Step 2: final MP4 fresh 只读验收**

只读取现有 final：验证文件 hash、尺寸、fps、帧数、时长；验证 R2 hash 与 final 指针一致；生成全时长 watch sheets 和最终接触表并逐段查看。这里和后续步骤不得再次调用 render。

- [ ] **Step 3: 独立总评审**

Reviewer 对照规格、机械门结果、R1/R2 与 final hash 逐项验证，不以子 Agent 的“完成”消息作为证据。若发现 Critical/Important 且需要改代码，则显式撤销 final 指针、回到对应 Demo 的 R1 前机械门，重新 high render 与 R2；不得在 final 后悄悄打补丁。

- [ ] **Step 4: 最后精确暂存并运行统一隐私审计**

Run:

```bash
git status --short
git diff --check
git add .gitignore README.md README_CN.md demos/README.md docs/roadmap.md \
  demos/11-hyperframes-3d-poster-wall demos/12-hyperframes-trig-projection-room \
  docs/superpowers/specs/2026-07-11-hyperframes-tutorial-demos-design.md \
  docs/superpowers/plans/2026-07-11-hyperframes-tutorial-demos.md
git diff --cached --name-only | rg '(^|/)(\.learning/runs|assets/local)(/|$)|\.mp4$|transcript'
python "$HOME/jacky-github/jacky-skills--tutorial-to-hyperframes-demo/skills/tutorial-to-hyperframes-demo/scripts/audit_staged.py" \
  --paths .gitignore README.md README_CN.md demos/README.md docs/roadmap.md \
  demos/11-hyperframes-3d-poster-wall demos/12-hyperframes-trig-projection-room \
  docs/superpowers/specs/2026-07-11-hyperframes-tutorial-demos-design.md \
  docs/superpowers/plans/2026-07-11-hyperframes-tutorial-demos.md
```

Expected: 实际 staged 路径扫描无输出；审计明确看到非空 staged 文件集并返回 `ok=true`。没有私人素材、用户主目录绝对路径、凭证、带敏感 query 的 URL 或原始转录被暂存。

- [ ] **Step 5: 立即提交已审计的本任务文件**

```bash
git commit -m "feat(demos): add two HyperFrames tutorial studies"
```

审计后若任何文件变化，必须重新暂存并重跑审计；不允许提交旧 index。

- [ ] **Step 6: 安全带回原工作树**

在原 `ai-clip-lab` 保留已有 `.media` 修改的前提下 cherry-pick 本提交；若有冲突，只处理索引文件，不覆盖用户改动。随后把本地 ignored 素材、snapshots、renders 复制到原 Demo 目录并再跑一次最终验证。
