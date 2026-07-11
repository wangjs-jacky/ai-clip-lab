# Cinematic Coverflow · 电影海报轮转

> 用一个连续中心位置，同时驱动 12 张竖版海报的横移、偏转、缩放、明暗、纵深与中心敲击节奏。

## 这是什么

这是一个 10 秒、1920×1080、30fps 的 HyperFrames Demo。12 张海报先从暗色星空中展开，再以先快后慢的节奏轮转；目标海报停在中心后，会单独放大并出现暖金色锁定光晕，最后整幅画面淡出。

Demo 不依赖真实电影海报或在线素材：

- `assets/fixtures/poster-01.svg` 到 `poster-12.svg` 是 12 张原创、确定性的 2:3 SVG fixture。
- `generate-audio.mjs` 会确定性生成 `center-tick.wav` 与 `final-hit.wav`，分别用于普通中心穿越和最终定格；二进制输出保持忽略，不进入 Git。
- 星空、暗角、扫描线与光晕由 CSS 和确定性伪随机数据生成。

因此，克隆仓库后无需下载额外媒体即可预览、检查和渲染。`dev`、`test`、`check`、`snapshot` 和 `render` 命令都会先生成这两段音效。

## 前置条件

- Node.js 22 或更高版本
- 可用的 Chromium 或 Chrome
- FFmpeg（只在检查最终 MP4 时需要）

项目通过 `npx` 固定使用 HyperFrames `0.7.49`，不要求全局安装 HyperFrames。首次运行时，如果本机没有对应缓存，`npx` 需要联网获取这个固定版本。

## 运行步骤

### 1. 确认 Node.js 版本

```bash
node --version
```

输出应为 `v22` 或更高版本。

### 2. 进入 Demo 目录

```bash
cd demos/13-hyperframes-cinematic-coverflow
```

### 3. 运行测试和静态检查

```bash
npm run check
```

这条命令会依次运行：

1. `coverflow.test.mjs` 中的运动模型测试。
2. HyperFrames `lint`。
3. HyperFrames `validate`。
4. 21 个时间采样点的 `inspect`。

看到所有命令通过，表示时间模型、资源引用和画面结构满足渲染要求。

### 4. 检查关键时间点

```bash
npm run inspect:keyframes
```

这会检查展开、减速、停稳、锁定和退场等关键帧。

### 5. 打开交互预览

```bash
npm run dev
```

HyperFrames Studio 默认在浏览器中打开。拖动时间轴时，同一个时间点应始终得到相同的海报位置和视觉状态。

### 6. 渲染 MP4

```bash
npm run render -- --quality high --output renders/cinematic-coverflow.mp4
```

渲染完成后，可用 FFmpeg 自带的 `ffprobe` 检查结果：

```bash
ffprobe -v error \
  -show_entries format=duration \
  -show_entries stream=codec_name,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 \
  renders/cinematic-coverflow.mp4
```

预期结果是约 10 秒、1920×1080、30fps，并同时包含视频与音频流。

## 替换成自己的 12 张海报

`index.html` 声明了 `poster01` 到 `poster12` 共 12 个字符串变量。每张图片都建议使用 2:3 竖版比例，例如 600×900；主体和标题应留在画面中部，避免侧边透视时被遮挡。

1. 把自己的图片放进本 Demo 的 `assets/` 子目录，例如 `assets/my-posters/`。
2. 新建一个不提交到仓库的 `my-posters.json`：

   ```json
   {
     "poster01": "assets/my-posters/01.jpg",
     "poster02": "assets/my-posters/02.jpg",
     "poster03": "assets/my-posters/03.jpg",
     "poster04": "assets/my-posters/04.jpg",
     "poster05": "assets/my-posters/05.jpg",
     "poster06": "assets/my-posters/06.jpg",
     "poster07": "assets/my-posters/07.jpg",
     "poster08": "assets/my-posters/08.jpg",
     "poster09": "assets/my-posters/09.jpg",
     "poster10": "assets/my-posters/10.jpg",
     "poster11": "assets/my-posters/11.jpg",
     "poster12": "assets/my-posters/12.jpg"
   }
   ```

3. 用变量文件渲染，并开启严格变量检查：

   ```bash
   npm run render -- \
     --variables-file my-posters.json \
     --strict-variables \
     --quality high \
     --output renders/my-coverflow.mp4
   ```

只想临时替换少量海报时，也可以使用 `--variables` 传入 JSON；未覆盖的变量会继续使用原创 fixture。

> [!note]
> 自己的素材仍需拥有合法使用权。这个 Demo 只提供动画机制，不附带任何第三方电影海报。

## 动画为什么能保持一致

核心逻辑位于 `coverflow.js`：

1. GSAP 只推进一个从 0 到 10 秒的线性时钟。
2. `centerAtTime()` 根据当前时间计算连续中心位置，前段强减速、末段平滑停稳。
3. 每张海报只根据“自身索引与中心位置的环形有符号距离”计算横移、Y 轴旋转、缩放、亮度、模糊和纵深。
4. 中心穿越时刻在加载时预先计算，音频元素直接使用这些固定时间点，不依赖播放过程中临时触发的事件。
5. 任意 seek 都从当前绝对时间重新计算，因此不会产生累计漂移。

## 验证检查点

- `0–0.8s`：海报从紧凑暗层展开为完整 Coverflow。
- `0.8–6.1s`：中心位置快速推进后持续减速，普通敲击由密变疏。
- `6.1–7s`：目标海报平滑停在中心，不发生反向回弹。
- `7–9.3s`：中心海报独立放大，金色光晕增强，其余海报与四周压暗；最终重击在 7 秒对齐定格。
- `9.3–10s`：保持锁定构图并整体淡出，最后一个可见帧接近全黑。

## 常见问题

### 为什么不为 12 张海报各写一段动画？

独立动画很难保证海报间距、朝向、亮度和纵深始终互相匹配。这里让 12 张海报共享同一个中心位置，再由距离统一派生所有视觉属性。

### 为什么敲击声没有在 JavaScript 里监听“经过中心”事件？

HyperFrames 渲染器会直接跳到任意帧。预先计算音频时间点可以让预览、seek 和离线渲染得到完全一致的声音节奏。

### 为什么目标海报停下后还会再放大？

轮转停稳和最终强调是两个不同动作。先结束位移，再让中心海报单独放大并提升光晕，能让观众明确感知“选中”时刻。

## 总结

这个案例展示了一种可复用的程序化动画方法：先建立一个连续主状态，再让所有画面属性和声音事件从它派生。这样既能获得复杂的空间层次，也能保持每一帧可计算、可测试、可重复渲染。
