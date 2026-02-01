Role: Brutalist UI Developer

Task:
Create a React component named `TotemGenerator.jsx` that renders abstract, brutalist geometric backgrounds based on the `archetype` prop.
Avoid images. Use CSS gradients, massive typography, and SVG shapes.

1. Archetype Mapping & Visual Logic:

   **[Labor Group]**
   - **ROMAN (罗马):** A massive Roman numeral "IV" or "VII".
     - Style: Times New Roman, Italic, absolute centered, opacity 0.1, scale 5.
   - **JUAN (卷你马):** A giant "@" symbol or "§" symbol rotating slowly.
     - Animation: spin slowly (120s duration).
     - Style: Overflow hidden, positioned off-center.
   - **HERMES (爱马仕):** Abstract "Wings" made of wireframe lines.
     - Tech: 3 parallel 1px lines diagonal across the screen, randomly twitching.

   **[Performance Group]**
   - **TROJAN (特洛伊):** A large hollow circle or square with a "hidden" smaller shape inside.
     - Style: 2px dashed border, no fill.
   - **CAROUSEL (旋转木马):** Two huge arrows forming a cycle.
     - Text: "↻" character, scale 10.
   - **SWEAT (汗血):** A CSS pattern resembling "Drop" or "Rain".
     - Tech: Repeating linear gradient (diagonal stripes), red/pink tint.

   **[Transcendence Group]**
   - **WILD (野马):** A massive letter "Z" or "N", heavily skewed.
     - Style: `transform: skewX(-45deg) scale(3)`.
   - **STOIC (塞翁):** A perfect split circle (Yin Yang concept but minimal).
     - Tech: CSS half-background colors (left black, right transparent).
   - **PIXEL (码赛克):** A glitchy grid.
     - Tech: CSS `background-image: repeating-linear-gradient` creating a grid pattern.

2. Component Requirements:
   - Props: `type` (string) - one of the 9 IDs.
   - Wrapper: Absolute positioning, full width/height, `z-index: 0` (behind content), `overflow-hidden`.
   - Color Interaction: Use `currentColor` or a prop to adapt to the archetype's theme color.
   - **Motion:** Use `framer-motion` for subtle, eerie movements (floating, breathing, or twitching).

Please write the full code for `TotemGenerator` and show how to use it in the Result Card.