# 06 · HyperFrames 相册开场动画

> 用 [HyperFrames](https://github.com/heygen-com/hyperframes)（HeyGen 开源的 HTML 原生视频框架）制作一支 1920×1080、10 秒的相册开场动画：左侧固定目录栏，照片从右侧「先快后慢」滑入，背景是模糊放大的同图残影、节奏慢半拍，四张照片轮换。整段动画就是一个 `index.html`。

## 一、效果说明

| 元素 | 设计 |
|------|------|
| 左侧目录栏 | 420px 玻璃拟态面板，专辑标题 + 4 条目录；当前条目琥珀色点亮，底部有匀速进度条 |
| 照片卡 | 16:9 圆角卡片，从画面右侧以 `power4.out`（先快后慢）滑入，停留期有 Ken Burns 微推近 |
| 背景层 | 当前照片的模糊放大版（blur 46px + 压暗），比前景**晚 0.45s、用 1.6s** 缓慢显影（"慢半拍"），全程缓慢推近 |
| 前景细节 | 取景框角标（呼吸动效）、底片编号章（DSC 编号）、REEL 元数据、01/04 计数器 + 刻度 |
| 节奏 | 每张照片一拍 2.25s，共 4 拍 + 1s 开场，总长 10s @ 30fps |
| 音频 | BGM 全程铺底（`data-volume 0.85`，10s 裁剪 + 淡入淡出 + loudnorm）；每次换拍前 50ms 一个轻 whoosh（`0.3`），声音领住画面 |

设计概念：「摄影交付册开卷」——左栏是暗房底片索引，右侧成片像从传送带滑出。强调色取自暗房安全灯的琥珀色 `#f5a13d`。

## 二、前置条件

1. **Node.js ≥ 22**（`node --version` 确认）
2. **FFmpeg**（`brew install ffmpeg`）
3. 4 张照片，命名为 `assets/photo-1.jpg` ～ `assets/photo-4.jpg`（建议 1920×1080；私人照片不入库，需自备）

> 字体已自托管在 `assets/fonts/`（League Gothic + JetBrains Mono，OFL 协议），渲染不依赖网络。中文回退到系统 PingFang SC。

## 三、运行步骤

### 3.1 准备照片

把你的 4 张图裁成 16:9 放进 `assets/`（示例：从 3:2 原片居中裁切）：

```bash
ffmpeg -i 原图.jpg -vf "crop=6000:3375,scale=1920:1080" -q:v 3 assets/photo-1.jpg
```

### 3.2 浏览器预览（带时间轴的 Studio）

```bash
npm run dev
```

打开终端提示的地址，可拖动时间轴逐帧查看。

### 3.3 质检

```bash
npm run check   # lint + validate + inspect 三连
```

预期：0 error。仅存的对比度提示来自装饰性幽灵大字（有意为之）。

### 3.4 渲染 MP4

```bash
npm run render -- -o renders/opening.mp4
```

预期输出：10.0s · 1920×1080 · H.264 · 约 12MB，本机（M2）耗时约 80s。

## 四、要点笔记（踩坑记录）

1. **预捆绑字体依赖运行时网络拉取**：HyperFrames 的 18 个内置字体按需从 Google Fonts/@fontsource 下载缓存（`~/.cache/hyperframes/fonts`）。Node fetch 不读 `HTTP_PROXY`，网络不可达时会**静默回退**成系统字体——版式悄悄变宽、溢出容器。解法：woff2 下到项目里显式 `@font-face`，一劳永逸。
2. **确定性规则**：单条 `gsap.timeline({ paused: true })` 挂到 `window.__timelines`；禁止 `repeat: -1`（呼吸动效用有限次数收在总时长内）；同一元素同一属性不能有重叠 tween。
3. **背景层模式**：全程可见的层（背景/目录栏）不做 clip，直接由时间轴驱动；框架的 clip 可见性控制不要和 opacity 动画打架。
4. **前景/背景同图复用**：背景用 `background-image` 而非再写一个 `<img>`，避免 `duplicate_media_discovery_risk`。
5. **有意溢出要标注**：Ken Burns 推近、卡片场外待命、幽灵字出血，先用 `npx hyperframes snapshot --at 1.8,5.0` 逐帧确认，再加 `data-layout-allow-overflow` / `data-layout-allow-overlap`。

## 五、声音资源从哪来（本 demo 的实际路径）

- **BGM**：HyperFrames 官方 `media-use` skill 首选 HeyGen 曲库（需 `heygen auth login --oauth`）；无凭证时可本地生成（Lyria 需 `GEMINI_API_KEY` / MusicGen 需 ~2GB torch）。本 demo 走第三条路：**免版权曲库下载 + `resolve --from` 登记**，快且质量稳。
- **音效**：`media-use` 内置 19 个音效（whoosh / click / riser / chime…），位于 skill 的 `audio/assets/sfx/`，无需网络。
- 音频接入组合的方式：`<audio>` 作为组合根的**直接子元素**，必须带唯一 `id`（否则渲染静音），用 `data-start/duration/track-index/volume` 控制。

### 音乐署名（CC-BY 4.0）

> "Carefree" — Kevin MacLeod ([incompetech.com](https://incompetech.com))
> Licensed under [Creative Commons: By Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

## 六、参考

- [HyperFrames 文档](https://hyperframes.heygen.com/introduction)
- [HyperFrames vs Remotion](https://hyperframes.heygen.com/guides/hyperframes-vs-remotion)
- 本仓库路线图：[docs/roadmap.md](../../docs/roadmap.md)（方向 06 · 程序化视频）
