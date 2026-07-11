# 11 · HyperFrames 3D 海报墙

> 一个 1920×1080、30fps、293 帧的 CSS 3D 记忆墙：标题从中线展开，海报按四个方向错峰组装，舞台随后侧倾，镜头在最后六秒巡航到右侧区域。

## 一、它展示什么

这个 Demo 把 `perspective`、元素分组入场、舞台倾斜和镜头巡航拆成四个独立层级。最重要的不是“让卡片旋转”，而是让观众先读懂平面版式，再看到整面墙获得空间深度。

| 层 | 作用 |
|---|---|
| `scene` | 提供 `perspective: 2200px`，相当于镜头与画面的距离 |
| `camera` | 只负责横移、上移和轻微放大 |
| `tilt-world` | 只负责 `rotationX: 20`、`rotationY: -10` |
| `poster-shell` | 固定卡片的最终位置和 Z 深度 |
| `poster` | 按上、左、右、下四组执行入场 |
| `poster img` | 只做轻微 Ken Burns，不和外层抢 transform |

默认素材是仓库内原创的抽象 SVG，不依赖私人照片，也不需要网络下载图片。

## 二、准备工作

1. Node.js 22 或更高版本；
2. FFmpeg（渲染 MP4 时使用）；
3. 可选：16 张你有权使用的照片。

## 三、运行与检查

```bash
cd demos/11-hyperframes-3d-poster-wall
npm run dev
```

执行完整质量检查：

```bash
npm run check
```

关键帧截图：

```bash
npm run snapshot -- --at 0.15,0.55,0.95,1.55,2.15,3.25,4.25,5.25,7.25,9.25
```

渲染草稿：

```bash
npm run render -- --quality draft --output renders/poster-wall-draft.mp4
```

## 四、使用本地照片覆盖 SVG

把照片放进被 Git 忽略的 `assets/local/`，再建立一个 JSON 文件。键名必须是 `poster01` 到 `poster16`：

```json
{
  "poster01": "assets/local/poster-01.jpg",
  "poster02": "assets/local/poster-02.jpg"
}
```

没有写到 JSON 的键会继续使用默认 SVG。渲染时传入：

```bash
npm run render -- \
  --variables-file ../../.learning/runs/你的运行记录/local-posters.json \
  --strict-variables \
  --quality high \
  --output renders/poster-wall.mp4
```

> [!note]
> `assets/local/`、`renders/` 和 `snapshots/` 都不会进入 Git。请只使用你拥有授权的照片。

## 五、验收检查点

1. `0.15s`：标题仍像一条压扁的水平切口；
2. `0.55s`：双行标题已经从中线完整展开；
3. `0.95–2.15s`：海报从四个不同方向错峰进入；
4. `3.25–4.25s`：组装完成后，整面墙才开始侧倾；
5. `5.25–9.25s`：镜头独立向右巡航，右侧榜单与边缘海报获得更高视觉权重；
6. 成片应为 1920×1080、30fps、293 帧，末尾保持空间状态，不做渐隐。

## 六、常见问题

### 为什么不能把 camera 和 tilt 写在同一个元素上？

两个动画会同时争用 `transform`，调参时很难判断是镜头移动还是舞台旋转造成构图变化。分层后，每个容器只有一个空间职责。

### 为什么照片从外层进入，图片本身只缩放？

这能避免同一元素出现重叠 transform tween。外层决定卡片路径，内层决定照片呼吸感。

### 为什么没有无限旋转的唱片？

HyperFrames 渲染要求确定性。黑胶只在唯一的 paused timeline 内完成有限角度转动，任意时间 seek 都会得到同一个画面。

## 七、总结

这个案例的核心公式是：**先组装平面信息，再倾斜空间，最后移动镜头。** 三个阶段严格分开，才能让 3D 不是装饰，而是可读的叙事升级。
