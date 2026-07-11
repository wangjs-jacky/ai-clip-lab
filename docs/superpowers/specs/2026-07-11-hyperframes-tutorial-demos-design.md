# 两个教学视频复现 Demo：设计规格

> 从两条教学视频中提取可执行机制，分别制作一个自包含、可检查、可渲染的 HyperFrames Demo。

## 范围决定

新增两个独立目录，使用路线图未占用的编号 11、12：

- `11-hyperframes-3d-poster-wall`
- `12-hyperframes-trig-projection-room`

源映射与身份：

| Source ID | 输入 | SHA-256 | 实际媒体参数 | 目标 Demo |
|---|---|---|---|---|
| `source-poster-tilt` | `王家盛的抖音 - 抖音(4).mp4` | `4973f15748cede46d219d5626ef006336a9bf463c902334c6a6f2358db9cf339` | 165.500s · 1280×720 · 30fps | Demo 11 |
| `source-data-motion` | `王家盛的抖音 - 抖音(2).mp4` | `73b86ddcc7ec595b9a09fd3aec2bdc87c537348f9a472e8f7721f5fb31ebbeec` | 286.033s · 1280×720 · 30fps | Demo 12 |

公开文档只保存以上脱敏文件名、hash 与时间码；原文件绝对路径、完整字幕与源帧留在 `.learning/`。

第二条教程包含五个独立数据动效。本轮选择教程讲解最完整、机制最有辨识度的“伪 3D 三面投影”，不做五段式 sampler。五段 sampler 会横跨 Canvas、Three.js/GeoJSON、DOM 时间尺、排名插值和挤出几何；在一个 Demo 中每段只能浅尝结果，反而违背教程“讲清运动原理”的方法。其余四种登记到路线图为后续候选。

## 共通规则

- 1920×1080、30fps、单次播放；
- 根元素显式定宽高，背景放在 full-bleed 子元素；
- exactly one paused GSAP timeline，注册到 `window.__timelines`；
- 禁止运行时随机数、墙钟、网络 fetch 和无限循环；
- 先写每个关键时刻的静态终态，再加动画；
- DOM 空间动画只使用 `x/y/scale/rotation/rotationX/rotationY`；Canvas 的 `phase/roomReveal/cameraYaw` 是确定性数值 state，不属于 DOM 布局属性；
- 每个项目含 `README.md`、`LEARNING.md`、`package.json`、`hyperframes.json`、`meta.json`、`index.html`；
- 私人或来源不明的本地照片不提交，路径与候选记录进入 `.learning/`；Demo 11 同时提交原创 SVG fixture，并通过 HyperFrames 图片变量允许本地照片覆盖 fallback；
- 本地成片与 snapshots 保留但由 `.gitignore` 排除；
- 每个项目必须通过 `npm run check`，再按关键时刻 snapshot，最后渲染高质量 MP4。

## Demo 11：3D Poster Wall

### 教程方法

先通过参数对照建立视觉因果：`perspective` 是镜头距离，值越小透视越强；`rotationX` 控制前后倒，`rotationY` 控制左右拧。先用单海报验证，再将标题、照片、唱片、列表面板拆成独立元素，在时间线上分组错峰入场，最后动画整个舞台与 camera wrapper。

核心证据：

- 00:16–00:24：口播明确提出“检查 AI 写的作业，再反向教会模型”；
- 00:34–00:46：屏幕代码显示 `.scene { perspective: 2200px; perspective-origin: 50% 50%; }`、网格 `translateZ(-120px)`；
- 01:17–01:48：关闭/打开 perspective 与 1750px/400px 参数对照；
- 01:48–02:04：解释 rotationX/rotationY 两个轴；
- 02:24–02:38：口播明确从单海报扩为多元素错峰入场后整体侧倾；
- 02:34.25–02:44.00：干净成片循环，提供标题、组装、倾斜、巡航和硬切的视觉证据。

### 视觉概念

“Midnight Field Notes”——一面由本机影像组成的暗房记忆墙。主标题与黑胶构成中心锚点，周围 16–20 个照片卡越过画框边缘；深炭黑网格背景、琥珀黄标题、米白正文、少量青绿色读数。照片按海报构图使用竖版或裁成 2:3，体现“画幅由构图决定”，不照搬上一案例的 16:9。

### 结构

```text
root
├── background/grid/grain/vignette
├── scene (perspective: 2200px)
│   └── camera (巡航 x/y/scale)
│       └── tilt-world (rotationX/rotationY)
│           ├── title-mask + title
│           ├── poster groups
│           ├── vinyl
│           └── most-watched panel
└── foreground metadata / progress
```

### 时间

- 0.00–0.55s：双行标题从水平中线 `scaleY:0 -> 1` 展开；
- 0.90–2.20s：照片按顶部/左/右/底部分组进入，相邻约 0.08–0.12s；
- 1.10–1.80s：唱片与列表面板以更重的 easing 入场；
- 3.00–4.30s：`tilt-world` 到 `rotationX:20 / rotationY:-10`；
- 3.80–9.50s：camera 向右区巡航，表现为内容左移、轻微上移和放大；
- 293 帧 / 9.7667s：结束，不做虚假的渐隐；ffprobe 容差不超过一帧。

### 关键实现

- 卡片最终位置全部写静态 CSS；
- 每个方向组使用显式 `fromTo()`，不让所有元素统一从下方进入；
- camera 与 tilt 分层，避免同一元素叠两组 transform tween；
- 图片的入场 transform 在外层，内部图片只做轻微 Ken Burns；
- CSS 唱片避免额外图片依赖；
- 素材使用本机可访问的照片候选，保存裁切与 `object-position` 决策；composition 默认 `data-var-src` 指向已提交 SVG fixture，私有照片通过 `.learning/local-posters.json` 的 `--variables-file` 覆盖。

### 验收时刻

`0.15 / 0.55 / 0.95 / 1.55 / 2.15 / 3.25 / 4.25 / 5.25 / 7.25 / 9.25s`。

必须看到：标题中线展开、按方向分组、组装后才整体倾斜、巡航揭示右区内容。不能退化成“所有卡一起淡入 + 一张图旋转”。

## Demo 12：Trig Projection Room

### 教程方法

画面本质是一张二维 Canvas。先定义共享三维坐标中的左墙、后墙和地面，再用同一透视投影函数映射到屏幕。单位圆上旋转点的上下分量投到后墙形成正弦波，前后深度分量投到地面形成余弦波。每一帧只更新一个主相位，所有点、轨迹、读数都从该相位派生。

核心证据：

- 00:10.6–00:19.3：成片先出现三面、圆、正弦与余弦，并明确说明没有真正三维模型；
- 00:19.3–00:40.9：口播逐层解释共享原点、左墙单位圆、后墙正弦、地面余弦；
- 00:54.6–01:09.3：深色最终版显示同一亮点旋转、两面投影点与虚线同步；
- 01:09.3–01:18.5：工作流卡明确“先有静态数据，后有动态效果”。

### 视觉概念

“Signal Chamber / Phase 01”——深色科学观测舱。三块半透明网格面在中心偏右形成严丝合缝的透视盒；暖金色单位圆、青绿色正弦轨迹、冰蓝色余弦轨迹。左侧有公式、相位、坐标和投影链路；前景有刻度、扫描线、注册角标与时间码。

### 技术结构

- 一个全屏 Canvas 负责房间、网格、曲线、投影线和发光点；
- DOM 负责标题、公式、图例、读数与框线；
- `projection.js` 只提供纯函数 `project({x,y,z}) -> {x,y,scale}`、相位求值与 `drawFrame(state)`，不知道 HyperFrames/GSAP；
- `index.html` 只负责 composition contract、DOM、唯一时间线与 state 到绘制函数的连接；
- GSAP timeline 只 tween `state.phase`、`state.roomReveal`、`state.traceReveal`、`state.cameraYaw` 等数值，并在 `onUpdate` 重绘；
- 不使用 Three.js，不声称存在真正 3D 模型。

### 五阶段时间线（11.0s）

1. 0.00–1.20s `construct`：从共同原点搭出墙/地面骨架，三面共边严丝合缝。
2. 1.20–2.40s `map`：单位圆、完整正弦与余弦静态结构逐步出现。
3. 2.40–3.00s `hold`：完整静态关系短暂停留，投影辅助线就位。
4. 3.00–9.00s `trace`：`theta: 0 -> 2π` 匀速一圈；圆点、后墙点、地面点和读数由同一相位同步派生。
5. 9.00–11.00s `resolve`：回到起点并显示 `ONE PHASE / THREE VIEWS` 与公式，空间保持完整。

### 数学关系

令 `theta = phase * 2π`：

- 圆点：`(0, sin(theta), cos(theta))`；
- 后墙正弦样本：沿时间轴取 `y = sin(t)`；
- 地面余弦样本：沿时间轴取 `z = cos(t)`；
- 当前点到两条曲线使用同一 theta 的投影辅助线连接。

所有曲线从同一数据源计算，不能手画三条互不相关的贝塞尔。

### 验收时刻

`1.20 / 2.40 / 3.00 / 4.50 / 6.00 / 7.50 / 9.00 / 10.20s`。

必须看到：三面共享交界；`theta=0 / π/2 / π / 3π/2 / 2π` 五个基准状态数学正确；固定空间内点在转，后墙与地面点分别对应上下/深度分量；所有读数同步且 2π 回到起点无累计漂移。不能退化成三个独立的预制动画。

## 文档与索引

- 根 `README.md`、`README_CN.md` 与 `demos/README.md` 增加 11、12；
- `docs/roadmap.md` 增加两个已完成方向，并把地图、时间尺、排名竞速和 3D 环形图列为后续独立候选；
- 每个 `LEARNING.md` 记录来源指纹、教程事实、视觉观察、实现推断、本地决策、验收关键帧和残余问题，但不提交完整口播稿。

## 质量门

每个 Demo：

1. 投影数学测试（Demo 12）与 `npm run check` 退出 0；
2. 关键时刻 snapshot 可打开，首/中/末状态和机制级特征正确；
3. 高质量 render 退出 0，MP4 非空；
4. ffprobe 显示 1920×1080、30fps，Demo 11 为 293 帧/9.7667s、Demo 12 为 330 帧/11.0s，误差不超过一帧；
5. 进入 R1 前所有机械 must-pass 全绿，否则修复或 blocked；
6. R1 完整审阅 draft 并仅给一个主观 top_fix；修正后直接渲染 high 候选，R2 完整解码并观看该新 hash，记录 `reviewed_render_sha256`、全时长 6fps watch sheets、关键过渡高密度帧与问题时间码；同一 hash 写入 final，final 指针建立后不得再渲染或替换成片；
7. 删除 `.learning` 后以默认 fixture 对两个 Demo 都做 clean-checkout smoke check/render，并分别核对 293 帧/9.7667s 与 330 帧/11.0s；
8. 精确暂存本任务文件后，用共享 staged-files 审计脚本确认新增内容不含用户主目录绝对路径、原视频/完整转录、真实鉴权值或敏感 query；审计必须看到非空 staged 集，策略文字与扫描器自身按精确 allowlist 处理；
9. `git status` 不跟踪私人照片、原视频、转录或 render。
