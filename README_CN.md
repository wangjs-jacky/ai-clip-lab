# AI Clip Lab · AI 剪辑实验室

> 用一个个可运行的 demo，把市面上所有 AI 剪辑玩法亲手试一遍。

[English](./README.md) | 中文

## 这是什么？

这个仓库收集 AI 视频剪辑相关的各种技术 demo：自动字幕、文本驱动剪辑、去气口、高光切片、程序化视频等等。每个 demo 都是 `demos/` 下的一个独立文件夹，自带 README、依赖说明和运行命令——克隆下来，进入任意一个文件夹就能跑。

## 仓库结构

```
ai-clip-lab/
├── demos/          # 每个 demo 一个独立文件夹
│   └── README.md   # demo 索引 + 目录规范
├── docs/
│   └── roadmap.md  # 候选 demo 方向清单 + 状态看板
├── assets/         # 公共测试素材（只放小文件）
└── README_CN.md
```

## Demo 索引

| # | Demo | 状态 |
|---|------|------|
| — | 完整候选清单见 [docs/roadmap.md](./docs/roadmap.md) | 🚧 规划中 |

demo 落地后会逐个补进这张表。状态图例：🚧 规划中 · 🧪 开发中 · ✅ 可运行。

## 目录规范

- 每个 demo **完全独立**：`demos/NN-slug/`，自带 `README.md`，说明它做什么、前置条件、怎么跑。
- 优先本地/开源方案（Whisper、ffmpeg 等）；用到云端 API 的会显式标注所需 key。
- 测试素材保持小体积；大文件用链接，不提交进仓库。

## 许可证

[MIT](./LICENSE)
