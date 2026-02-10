# Cinelab — Claude Code Instructions

## Magic Commands

When the user types any of these commands, execute them immediately:

| Command | Action |
|---------|--------|
| `StartEngine!` | `cd /Users/yamacozkan/Desktop/Kraftreich/Tools/Cinelab && npm run start-engine` |
| `StopEngine!` | `cd /Users/yamacozkan/Desktop/Kraftreich/Tools/Cinelab && npm run stop-engine` |
| `Fabrication! <folder>` | `cd /Users/yamacozkan/Desktop/Kraftreich/Tools/Cinelab && npm run fabrication -- <folder>` |
| `StopFabrication!` | `cd /Users/yamacozkan/Desktop/Kraftreich/Tools/Cinelab && npm run stop-fabrication` |

- `<folder>` is the path the user provides after "Fabrication!"
- Example: `Fabrication! ./photos` or `Fabrication! /Users/yamacozkan/Desktop/shoots`
- Optional flags: `--concurrency 5`, `--config ./custom.json`

## Provider Auto-Detection

When running Cinelab through Claude Code, the AI provider should be **Anthropic (Claude)**.
Before running `StartEngine!` or `Fabrication!`, ensure `.env` has:
```
VITE_PROVIDER=anthropic
VITE_ANTHROPIC_API_KEY=<key>
```

## Project Info

- **Path:** `/Users/yamacozkan/Desktop/Kraftreich/Tools/Cinelab/`
- **Stack:** React 19 + TypeScript + Vite + Tailwind v4
- **Port:** 3000
- **Engine:** Multi-AI (Gemini / OpenAI / Anthropic)
