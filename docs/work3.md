# Project: "2026 Equine Psyche Analysis" (2026 测测你是什么马)

## 1. Product Overview
Build a high-end, viral H5 personality test.
**Theme:** A dystopian, satirical workplace/academic survival test.
**Visual Style:** "Paper Grunge" + "Thermal Printer" + "Pseudo-Medical Record".
**Core Loop:** Landing -> 8 Contextual Questions (Weighted Scoring) -> "Fake" Analysis Loading -> Result (The Receipt).

## 2. Visual Specifications
-   **Background:** Off-white (#F0EFE9) with a heavy SVG Noise overlay.
-   **The "Receipt" (Result Card):** -   Looks like a long, jagged thermal paper receipt.
    -   Top: Serrated edge (CSS clip-path).
    -   Texture: Slight multiply blend mode to simulate ink absorption.
    -   Animation: "Printing" effect (scrolls down from top, line by line).
-   **Typography:** -   Headings: Bold, Compressed Sans-Serif (Impactful).
    -   Body: Monospace (Typewriter style).

## 3. The 9 Archetypes (Logic Mapping)
Map the final scores to these 9 IDs:
1.  **[Labor]** -   `ROMAN` (罗马): High Execution, Low Scheming. (The Savior)
    -   `JUAN` (卷你马): High Execution, High Anxiety. (The Overachiever)
    -   `HERMES` (爱马仕): High Visibility, Low Execution. (The Academic Slave)
2.  **[Performance]** -   `TROJAN` (特洛伊木马): High Scheming, Low Visibility. (The Conspirator)
    -   `CAROUSEL` (旋转木马): High Visibility, Zero Output. (The Fake Busy)
    -   `SWEAT` (汗血宝马): High Output, Low Recognition. (The Victim)
3.  **[Transcendence]** -   `WILD` (野马分鬃): High Volatility, High Resignation. (The Rebel)
    -   `STOIC` (塞翁失马): Low Emotion, Low Expectation. (The Nihilist)
    -   `PIXEL` (码赛克): Zero Visibility, Zero Output. (The Ghost)

## 4. Scoring Algorithm (Weighted System)
Do NOT use simple A/B/C counts. Use a `weights` system.
-   **Dimensions:** `scheming`, `execution`, `mental_state`, `visibility`, `resignation`.
-   **Logic:** -   Each option adds/subtracts points to specific dimensions.
    -   `calculateResult()` function determines the archetype based on the dominant dimension or specific combos.

## 5. Question Data (Use this Exact JSON)
```json
[
  {
    "id": 1,
    "q": "周一早上9:00，闹钟响起的瞬间，你的灵魂在哪里？",
    "options": [
      { "text": "肉体已在工位，灵魂还在做梦", "weights": { "execution": 5, "mental_state": -2 } },
      { "text": "思考全人类为什么还要上班", "weights": { "resignation": 5, "mental_state": -5 } },
      { "text": "已经在群里发了'收到'，但人还在床上", "weights": { "visibility": 5, "execution": -5 } }
    ]
  },
  {
    "id": 2,
    "q": "面对甲方第12次完全不合理的修改意见：",
    "options": [
      { "text": "毁灭吧，累积工时我不亏", "weights": { "execution": 5, "mental_state": -3 } },
      { "text": "表面笑嘻嘻，背地里下毒", "weights": { "scheming": 5, "visibility": 2 } },
      { "text": "已读不回，假装信号不好", "weights": { "resignation": 4, "visibility": -5 } },
      { "text": "立马把锅甩给实习生", "weights": { "scheming": 5, "execution": -2 } }
    ]
  },
  {
    "id": 3,
    "q": "公司高层内斗，两派都在拉拢你：",
    "options": [
      { "text": "双面间谍，谁赢跟谁", "weights": { "scheming": 5, "visibility": 3 } },
      { "text": "听不懂，继续写我的Bug", "weights": { "execution": 5, "scheming": -5 } },
      { "text": "借机上厕所，消失两小时", "weights": { "visibility": -5, "resignation": 3 } }
    ]
  },
  {
    "id": 4,
    "q": "假如AI明天就能替代你，你会：",
    "options": [
      { "text": "连夜学习Prompt，试图PUA AI", "weights": { "execution": 3, "scheming": 2 } },
      { "text": "太好了，终于可以合法躺平了", "weights": { "resignation": 5, "mental_state": 5 } },
      { "text": "焦虑到斑秃，开始背八股文", "weights": { "execution": 5, "mental_state": -10 } }
    ]
  }
  // (Please generate 4 more questions following this logic)
]