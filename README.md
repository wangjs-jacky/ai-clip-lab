# AI Clip Lab

> A hands-on playground for AI-powered video editing — every technique gets a runnable demo.

English | [中文](./README_CN.md)

## What is this?

This repo collects self-contained demos of AI video editing techniques: auto subtitles, text-based editing, silence removal, highlight extraction, programmatic video, and more. Each demo lives in its own folder under `demos/` with its own README, dependencies, and sample commands — clone, enter one folder, and run.

## Repository Layout

```
ai-clip-lab/
├── demos/          # One folder per demo, self-contained
│   └── README.md   # Demo index & folder conventions
├── docs/
│   └── roadmap.md  # Candidate demo directions & status board
├── assets/         # Shared sample clips / images (small files only)
└── README.md
```

## Demo Index

| # | Demo | Status |
|---|------|--------|
| 06 | [HyperFrames album opening title](./demos/06-hyperframes-opening/) — fixed left index rail, photos sliding in with ease-out, blurred background lagging half a beat | ✅ runnable |
| — | See [docs/roadmap.md](./docs/roadmap.md) for the full candidate list | 🚧 planning |

Demos will appear here as they land. Status legend: 🚧 planning · 🧪 in progress · ✅ runnable.

## Conventions

- Each demo is **independent**: `demos/NN-slug/` with its own `README.md` explaining what it does, prerequisites, and how to run it.
- Prefer local / open-source models first (Whisper, ffmpeg, etc.); cloud APIs are noted explicitly with required keys.
- Sample media stays small; large files are linked, not committed.

## License

[MIT](./LICENSE)
