# Cinelab React — Dev Log

## v2.4.1 — Code Review Fixes (2026-02-12)
Full code review applied from Produkt learnings. All critical + medium + low issues fixed.

**Critical Fixes:**
- ✅ Provider override logic: now matches Engelism/Produkt pattern
  - Previous: silent fallback when explicit provider had no key
  - Now: explicit error if `VITE_PROVIDER` set but key missing/invalid
  - Validates provider name against valid values (`provider-config.ts`)
- ✅ Output validation: StepOutput now dispatches `SET_GENERATED_PROMPT`
  - Previous: completion state not tracked properly
  - Now: reducer properly marks step as complete when prompt generated

**Medium Fixes:**
- ✅ Clipboard error handling: try/catch around `navigator.clipboard.writeText`
  - Previous: unhandled rejection on non-HTTPS or permission denied
  - Now: graceful error handling, prevents console errors

**Low Fixes:**
- ✅ Memory leak: revoke old object URL on new reference upload
  - Previous: only cleaned up URLs on CLEAR/RESET
  - Now: revokes previous URL when SET_REFERENCE dispatched (`useWizardReducer.ts`)

**Fabrication Script:**
- ✅ Provider validation: explicit error if config specifies invalid provider

All tests passing:
- `npm run lint` — ✅ no errors
- `npm run build` — ✅ successful

1 commit pushed to GitHub: 54c23d6

## Proje
- **Path:** `/Users/yamacozkan/Desktop/Kraftreich/Tools/Cinelab-React/`
- **Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Port:** 3001 (3000 mesgul oldugu icin)

## Durum: Calisiyor — JSON schema ve gorsel tutarliligi COZULDU

### Tamamlanan Isler
1. Proje scaffold (Vite + React + Tailwind v4)
2. Kraftreich brand theme (3 renk: Obsidian/Bone/Ash + Warbler font)
3. Data layer (library.json + TypeScript types + useReducer)
4. Wizard shell (5 step indicator + nav buttons + step transitions)
5. Step 1: Reference — drag & drop image upload
6. Step 2: Equipment — 23 kamera + 14 lens + f-stop + ISO
7. Step 3: Art Direction — 7 genre -> 57 artist + director's notes
8. Step 4: Lighting — Studio/Outdoor toggle, 12 preset, custom light controls, aspect ratio
9. Step 5: Output — Gemini API call + JSON recipe + copy/download
10. Gemini API entegrasyonu (REST API, gemini-3-flash-preview)

### Gemini API Ayarlari
- Model: `gemini-3-flash-preview`
- System instruction: "Act as a technical Director of Photography..."
- Temperature: 0.1
- Response: `application/json`
- API Key: `.env` dosyasinda `VITE_GOOGLE_API_KEY`
- Endpoint: `v1beta/models/gemini-3-flash-preview:generateContent`

### Fix Gecmisi
- **enum -> const object:** TypeScript `erasableSyntaxOnly` yuzunden `WizardStep` enum'u const object'e cevrildi
- **type imports:** `verbatimModuleSyntax` icin `import type` kullanildi
- **LightControls layout:** Per-light grid-cols-2 -> tek sutun (slider overlap fix)
- **Prompt builder v1 (yanlis):** Sadece JSON object uretiyordu, talimat dili yoktu
- **Prompt builder v2 (yanlis):** Streamlit'in Gemini'ye gonderdigi ic talimati direkt kullaniciya veriyordu
- **Prompt builder v3 (dogru):** Streamlit `build_prompt()` ile birebir ayni, Gemini API'ye gonderiliyor
- **REST API camelCase fix:** `system_instruction` -> `systemInstruction`, `inline_data` -> `inlineData`, `mime_type` -> `mimeType`, `response_mime_type` -> `responseMimeType`

### 2026-02-10: JSON Schema + Prompt Fix (COZULDU)

**Sorun:** Gemini her seferinde farkli JSON key isimleri ve nesting yapisi uretiyordu.
Ornegin: `environment_override` vs `environment_modification` vs `location_switch`,
`lens_specs` vs `lens_profile` vs `lens_specifications`. Streamlit de ayni sorunu yasiyordu.

**Kok neden:** Prompt sadece "Provide ONLY raw, valid JSON" diyordu, schema tanimlanmamisti.

**Cozum (5 fix):**
1. `responseSchema` — gemini.ts'e Gemini API native JSON schema eklendi. Tum key isimleri, nesting, tipler sabitlendi.
2. Prompt'a exact key referanslari — OUTPUT kismina tum phase key isimleri yazildi.
3. POSE OVERRIDE — Studio seciliyse ve referansta model outdoor objeye yaslaniyorsa, secilen fotografcinin tarzinda serbest editorial poza gecis.
4. HARD RULE — Studio sahnelerinde hicbir isik ekipmani kadraja girmeyecek, invisible.
5. COMPOSITION RULE — `composition` alani: head-to-toe framing + artist-style pose + zero clutter + zero equipment.

**Sonuc:** JSON schema %100 tutarli. Gorseller clean, full-body, ekipmansiz, fotografci tarzinda poz.
Ayni fix'ler Streamlit `cine_engine.py`'ye de uygulandi.

### Dosya Yapisi
```
Cinelab-React/
├── .env                          # VITE_PROVIDER + API keys
├── cinelab-config.json           # Batch config (UI'dan export edilir)
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.scripts.json         # Node.js tsconfig (scripts/ icin)
├── scripts/
│   └── fabricate.ts              # CLI batch script
├── public/
│   ├── favicon.svg
│   └── fonts/WarblerVariable.ttf
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css                 # Tailwind + Kraftreich tokens + animations
    ├── types/
    │   ├── library.ts
    │   ├── wizard.ts             # WizardStep as const object (not enum)
    │   └── batch-config.ts       # BatchConfig (serializable WizardState subset)
    ├── data/
    │   ├── library.json
    │   └── useLibrary.ts
    ├── engine/
    │   ├── validation.ts
    │   ├── prompt-builder.ts     # Prompt + schema key referanslari + pose/equipment kurallari
    │   ├── provider-types.ts     # CineProvider interface + ProviderConfig
    │   ├── provider-config.ts    # resolveConfig() — env'den provider/model/key
    │   ├── response-schema.ts    # JSON Schema formatinda evrensel recipe schema
    │   ├── utils.ts              # fileToBase64()
    │   ├── run.ts                # runCineEngine() facade — tek entry point
    │   └── providers/
    │       ├── gemini.ts         # Gemini adapter
    │       ├── openai.ts         # OpenAI adapter
    │       └── anthropic.ts      # Anthropic adapter
    └── components/
        ├── WizardShell.tsx
        ├── StepIndicator.tsx
        ├── useWizardReducer.ts
        ├── StepReference.tsx
        ├── StepEquipment.tsx
        ├── StepArtDirection.tsx
        ├── StepLighting.tsx
        ├── LightControls.tsx
        ├── StepOutput.tsx
        └── ui/
            ├── ImageUpload.tsx
            ├── SelectCard.tsx
            ├── InfoBox.tsx
            └── OptionPill.tsx
```

### 2026-02-10: Dynamic Composition Framing (COZULDU)

**Sorun:** `composition` alani her zaman "full-body head-to-toe framing" diyordu. Referans gorsel portrait veya half-body ise yanlis framing uretiyordu.

**Cozum (3 fix):**
1. **FRAMING ANALYSIS** talimati — Phase 1'e eklendi: Gemini referans gorselden framing tipini tespit eder (close-up / portrait / half-body / full-body).
2. **OUTPUT composition kurali** — Hard-coded "head-to-toe" yerine "detected framing type preserved exactly" oldu.
3. **responseSchema** — `framing_type` alani eklendi, enum: ["close-up", "portrait", "half-body", "full-body"].

**Sonuc:** Referans gorselin framing'i ne ise JSON recipe'de de o korunuyor.

### 2026-02-10: Provider Abstraction (Roadmap 1 + 3 TAMAMLANDI)

**Sorun:** Engine katmani Gemini'ye hard-coded bagliyd. Baska AI provider kullanilamiyordu.

**Cozum — Adapter Pattern:**
- `engine/gemini.ts` parcalandi -> 8 yeni dosya
- `CineProvider` interface: her provider ayni kontrati implemente ediyor
- `CineResponseSchema`: standart JSON Schema formatinda evrensel schema
  - Gemini: `toGeminiSchema()` ile uppercase'e cevirir
  - OpenAI: `response_format.json_schema` ile direkt kullanir
  - Anthropic: `tool_use input_schema` ile direkt kullanir
- `provider-config.ts`: `.env`'den `VITE_PROVIDER` okur, provider secer
- `run.ts`: tek entry point, `runCineEngine()` imzasi degismedi
- UI'da tek degisiklik: StepOutput import yolu

**Yeni dosya yapisi:**
```
src/engine/
  provider-types.ts       # CineProvider interface + config types
  provider-config.ts      # resolveConfig() — env'den provider/model/key okur
  response-schema.ts      # JSON Schema formatinda evrensel recipe schema
  utils.ts                # fileToBase64()
  run.ts                  # runCineEngine() facade (eski gemini.ts yerine)
  prompt-builder.ts       # DEGISMEDI
  validation.ts           # DEGISMEDI
  providers/
    gemini.ts             # Gemini adapter
    openai.ts             # OpenAI adapter
    anthropic.ts          # Anthropic adapter
```

**Env config (.env):**
```
VITE_PROVIDER=gemini        # gemini | openai | anthropic
VITE_GOOGLE_API_KEY=...     # Gemini key
VITE_OPENAI_API_KEY=...     # OpenAI key (opsiyonel)
VITE_ANTHROPIC_API_KEY=...  # Anthropic key (opsiyonel)
VITE_MODEL=...              # Model override (opsiyonel)
```

**Sonuc:** Provider degistirmek icin sadece `.env` degisir. IDE/agent fark etmez.

### 2026-02-10: Batch Otomasyon (Roadmap 2 TAMAMLANDI)

**Sorun:** 235 gorseli tek tek wizard'dan gecirmek imkansiz.

**Cozum:**
1. **Save Config butonu** — StepOutput'a eklendi. Wizard ayarlarini `cinelab-config.json` olarak export eder.
2. **CLI script** — `npm run fabricate -- ./photos` komutu ile toplu islem:
   - Config dosyasini okur (varsayilan: `cinelab-config.json`, `--config` ile degistirilebilir)
   - `.env`'den provider/model/key okur (dotenv)
   - Klasordeki tum gorselleri (jpg/png/webp) sirali isler
   - Her gorsel icin `Prompts/{dosya-adi}.json` olarak recipe yazar
   - Progress log: `[12/235] photo.jpg -> OK`
   - Hata durumunda loglayip devam eder, sonunda ozet verir

**Yeni dosyalar:**
```
src/types/batch-config.ts     # BatchConfig interface (serializable WizardState)
scripts/fabricate.ts           # CLI batch script (tsx ile calisir)
tsconfig.scripts.json          # Node.js uyumlu tsconfig
```

**Kullanim:**
```bash
# 1. UI'da wizard'i tamamla, Save Config butonuna tikla
# 2. cinelab-config.json'i proje rootuna koy
# 3. CLI calistir:
npm run fabricate -- ./photos
npm run fabricate -- ./photos --config ./ozel-config.json
```

### ~~Sonraki Adimlar~~ TAMAMLANDI (2026-02-10)
- ~~Farkli provider'lar ile test et (OpenAI, Anthropic)~~ — Code review + model guncelleme + JSON pretty-print
- ~~CORS proxy gerekirse vite.config.ts'e ekle~~ — Vite proxy + browser/Node.js URL ayirimi
- Farkli fotografci + lighting preset kombinasyonlarini test et (manuel test)
- ~~Batch script'e paralel islem ekle (rate limiting ile)~~ — `--concurrency N` + Promise pool

### 2026-02-10: Stabilite + UX + Altyapi Guncelleme

**6 adimlik iyilestirme:**

1. **LightControls useEffect fix** — `useEffect` icinde cascading `setState` kaldirildi, clamp logic `onClick` handler'ina tasindi.

2. **ErrorBoundary** — Render hatalari icin branded fallback UI. `App.tsx`'te wizard content'i sariyor. "Try Again" butonu ile recovery.

3. **Loading state** — API call sirasinda elapsed timer (`Generating... 5s`) + pulse bar animasyonu (`index.css`).

4. **Batch paralel islem** — `--concurrency N` argumanini (1-10, default: 3) + `runPool()` native Promise pool. Sirali for-loop yerine paralel task execution.

5. **Provider review** — Anthropic default model `claude-sonnet-4-5-20250929`'a guncellendi. OpenAI ve Anthropic JSON ciktisi `JSON.stringify(_, null, 2)` ile pretty-printed.

6. **CORS proxy** — `vite.config.ts`'e OpenAI + Anthropic proxy kurallari. Provider'larda `'window' in globalThis` ile browser/Node.js ayirimi. Browser'da proxy, Node.js'te direkt URL.

**Ek iyilestirmeler:**

7. **Provider auto-detect** — `VITE_PROVIDER` set edilmemisse, mevcut API key'lerden otomatik provider secimi. Oncelik: Gemini > OpenAI > Anthropic.

8. **Sihirli komutlar** — `StartEngine!`, `StopEngine!`, `Fabrication!`, `StopFabrication!` komutlari npm script olarak eklendi. Her AI agent icin talimat dosyalari olusturuldu:
   - `CLAUDE.md` — Claude Code
   - `GEMINI.md` — Google Antigravity
   - `.cursorrules` — Cursor
   - `AGENTS.md` — OpenAI Codex

**Yeni npm scripts:**
```bash
npm run start-engine          # Vite dev server + browser ac
npm run stop-engine           # Port 3000 kapat
npm run fabrication -- ./dir  # Toplu prompt uret
npm run stop-fabrication      # Fabrication durdur
```

**Test sonucu:** Antigravity (Gemini 3 Pro) ile test edildi. UI, prompt uretimi, JSON schema tutarliligi — hepsi stabil.

---

## Yol Haritasi (Roadmap)

### ~~1. Provider Kontrolu — Multi-AI Destek~~ TAMAMLANDI (2026-02-10)
### ~~2. Batch Otomasyon — Toplu Islem Modu~~ TAMAMLANDI (2026-02-10)
### ~~3. IDE / Agent Adaptasyonu — Platform Bagimsiz Calisma~~ TAMAMLANDI (2026-02-10)
### ~~4. Stabilite + UX + Altyapi~~ TAMAMLANDI (2026-02-10)
