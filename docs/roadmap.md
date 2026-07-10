# AI 剪辑 Demo 路线图

> 候选方向清单 + 状态看板。每个方向做成 `demos/NN-slug/` 独立 demo，做完回来更新状态。

状态图例：🚧 规划中 · 🧪 开发中 · ✅ 可运行 · ❄️ 暂缓

## 候选方向

| # | 方向 | 一句话说明 | 候选技术 | 状态 |
|---|------|-----------|----------|------|
| 01 | 自动字幕 | 音视频 → SRT/VTT 字幕，并烧录进视频 | Whisper / MLX-Whisper + ffmpeg | 🚧 |
| 02 | 静音/气口自动剪 | 检测静音段自动剪掉，口播视频一键紧凑 | ffmpeg silencedetect / auto-editor | 🚧 |
| 03 | 文本驱动剪辑 | 删转写文稿里的字 = 删视频片段（Descript 玩法） | Whisper 词级时间戳 + ffmpeg | 🚧 |
| 04 | 高光切片 | 长视频 → 多条短视频，LLM 挑高光片段 | Whisper + LLM 选段 + ffmpeg | 🚧 |
| 05 | 音乐踩点剪辑 | 检测音乐节拍，素材自动卡点切换 | librosa beat tracking + ffmpeg | 🚧 |
| 06 | 程序化视频 | 用代码写视频，数据驱动批量出片 | HyperFrames（已做 [demo](../demos/06-hyperframes-opening/)）/ Remotion | ✅ |
| 07 | AI 配音替换 | 文稿 → TTS 配音，替换/混合原音轨 | edge-tts / MiniMax / OpenAI TTS | 🚧 |
| 08 | 智能横转竖 | 16:9 → 9:16，人脸/说话人跟踪自动取景 | 人脸检测 + ffmpeg crop | 🚧 |
| 09 | 一键成片 | 素材堆 + 一句话需求 → LLM 编排时间线出片 | LLM + ffmpeg / 编辑 DSL | 🚧 |
| 10 | AI 抹除/擦除 | 去水印、去路人等视频 inpainting | ProPainter / IOPaint | 🚧 |
| 11 | 3D 海报墙 | 多组海报沿边缘入场，组装后整体透视倾斜并巡航 | HyperFrames + CSS 3D + GSAP（已做 [demo](../demos/11-hyperframes-3d-poster-wall/)） | ✅ |
| 12 | 三角函数投影舱 | 同一相位驱动单位圆、正弦墙与余弦地面 | HyperFrames + Canvas 2D（已做 [demo](../demos/12-hyperframes-trig-projection-room/)） | ✅ |
| 13 | 3D 数据地图 | 把区域数据映射到可旋转、可聚焦的空间地图 | Three.js + GeoJSON | 🚧 |
| 14 | 连续时间尺 | 固定指针下让刻度、日期与事件沿统一时间轴流动 | DOM/SVG + GSAP | 🚧 |
| 15 | 排名竞速图 | 用单一进度插值排名、条形长度与数值 | Canvas 2D / SVG | 🚧 |
| 16 | 挤出式 3D 环形图 | 让环形占比拥有厚度、灯光和可读标签 | Three.js | 🚧 |

> 想到新方向直接往表里加行；开工时把状态改成 🧪 并建对应 `demos/NN-slug/` 目录。

## Demo 目录规范

每个 demo 目录至少包含：

```
demos/01-auto-subtitle/
├── README.md    # 做什么 / 前置依赖 / 运行步骤 / 效果截图
├── ...          # 代码与脚本
└── samples/     # 小体积测试素材（可选，公共素材放仓库根 assets/）
```

README 按「零基础可复现」标准写：完整命令、预期输出、常见问题。
