# Demos 索引

每个子目录是一个独立可运行的 AI 剪辑 demo，命名规范：`NN-slug/`（两位序号 + 英文短横线名）。

| 目录 | 说明 | 状态 |
|------|------|------|
| [06-hyperframes-opening](./06-hyperframes-opening/) | HyperFrames 相册开场动画：左侧目录栏 + 照片先快后慢滑入 + 模糊背景慢半拍轮换，HTML 即视频 | ✅ |
| [11-hyperframes-3d-poster-wall](./11-hyperframes-3d-poster-wall/) | 海报分组入场后组装成 CSS 3D 墙，整体倾斜并进行分层镜头巡航 | ✅ |
| [12-hyperframes-trig-projection-room](./12-hyperframes-trig-projection-room/) | Canvas 2D 伪 3D 投影舱：单位圆、正弦与余弦共享唯一相位 | ✅ |
| [13-hyperframes-cinematic-coverflow](./13-hyperframes-cinematic-coverflow/) | 12 张原创竖版海报共享连续中心位置，形成先快后慢的空间轮转与中心锁定 | ✅ |

其余候选方向见 [../docs/roadmap.md](../docs/roadmap.md)。

## 新增 demo 步骤

1. 在 `docs/roadmap.md` 认领一个方向（状态改 🧪）
2. 创建 `demos/NN-slug/` 目录，写 `README.md`（做什么 / 依赖 / 运行步骤）
3. 跑通后把状态改 ✅，并同步更新本索引和根 README 的 Demo 表
