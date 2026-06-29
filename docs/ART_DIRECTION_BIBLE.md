# Art Direction Bible: Magical Word Kingdom

## Purpose

This document defines the original visual direction for the next 3D upgrades.
It is intentionally short so it can guide implementation without becoming a
heavy design system.

The goal is not to imitate any adventure game. The goal is to reach the same
level of clarity and care: readable silhouettes, memorable landmarks, warm
exploration, and a world where the learning mechanic is visible before the
lesson panel opens.

## Visual Pillars

1. Child-readable first.
   Shapes must be simple enough for ages 6-7 to understand at gameplay camera
   distance. A child should quickly see paths, safe boundaries, stations, and
   the next destination.

   Execution check: zoom out to the normal camera distance. If the area still
   reads as path, station, obstacle, and destination, the pillar is working.

2. Small adventure, not school worksheet.
   The map should feel like a compact journey through a magical reading place:
   crossing a bridge, reaching a glowing stone, entering a book arch, or opening
   a dictation gate. Learning should feel embedded in the world, not pasted on
   top of it.

   Execution check: hide the lesson panel. The 3D world should still suggest
   where reading, nikud, English, and dictation happen.

3. Educational meaning in every landmark.
   Decorations should reinforce literacy. Floating letters, page paths, syllable
   stones, nikud springs, and voice lanterns are useful. Random magical clutter
   is not.

   Execution check: every major object can answer "what learning idea does this
   support?" If the answer is only "it looks magical", simplify or remove it.

## Original World Identity

The world is a gentle archipelago of reading places called the Word Isles.
Instead of one castle courtyard, the hub is a small island path with four clear
learning zones:

- Reading Library: book arches, page tiles, warm reading stones.
- Nikud Spring: shallow glowing water, vowel marks hovering like fireflies.
- English Tower: blocky letter windows, simple banners with abstract letter
  patterns.
- Dictation Gate: listening lanterns, sound-wave stones, a sealed gate that
  glows after success.

The tone is warm, playful, and adventurous. It should feel handcrafted and
low-poly, with visible paths and soft magical highlights.

## Palette

Use a balanced, non-monochrome palette:

- Grass and moss: fresh green, not neon.
- Stone and paths: pale warm stone, sand, and parchment.
- Water and light: cyan and soft blue for readable glow.
- Learning accents:
  - Hebrew / reading: green and warm gold.
  - Nikud: amber and small cyan highlights.
  - English: sky blue with white letter marks.
  - Story / dictation: violet with gold lantern light.

Avoid a scene dominated by one hue. If the screen reads as all blue, all purple,
all beige, or all green, rebalance with material variety.

## Lighting

Lighting should be bright enough for young children and soft enough to feel
magical:

- Clear sky background.
- Warm directional light from above and front-left.
- Soft shadows under the player, stones, arches, and stations.
- Small emissive highlights only where they guide attention.

Do not rely on darkness, fog, or contrast-heavy mood lighting. This is a
children's learning game, so clarity wins.

## Shape Language

- Paths: rounded stones, page-shaped slabs, and readable bridges.
- Boundaries: low walls, water edges, hedges, or book stacks.
- Stations: larger landmarks, each with a unique silhouette.
- Player scale: child-sized, readable beside stations, never swallowed by props.
- Details: chunky low-poly forms with simple bevel-like silhouettes where
  possible.

Avoid thin visual noise, tiny props, and complex silhouettes that collapse at
camera distance.

## Camera And Composition

The default camera should show:

- The player.
- The current path.
- At least one destination landmark.
- A hint of the surrounding world boundary.

Keep the camera close enough to feel embodied, but high enough that the child
can plan movement. The map should support mobile framing later, so important
objects must not live only at the far edges of the canvas.

## UI Integration

The lesson panel remains outside the 3D scene for now. The world should support
the UI by using matching colors and short in-world prompts:

- Station colors must match the existing legend where practical.
- Station prompts should be one short sentence.
- World feedback after success should be visual first: glow, path light, book
  opening, or small star burst.
- Do not add long instruction text inside the canvas.

## Forbidden References

Do not copy or closely imitate:

- Protected game characters, costumes, props, icons, map layouts, music, names,
  story beats, or UI patterns.
- Famous wizard schools, houses, crests, scarves, house colors, spells, wands,
  creatures, or school layouts.
- Branded educational game characters, mascots, screenshots, reward systems,
  logos, or exact screen compositions.
- Any generated asset that clearly resembles a known franchise character or
  protected creature.

Quality references are allowed only at the level of general craft: strong
silhouettes, readable landmarks, warm exploration, and clear player guidance.

## Theme Directions

1. Word Isles
   A small island hub connected by page-stone paths, syllable bridges, and
   glowing learning landmarks. Best fit for the current 3D prototype because it
   can evolve from the existing courtyard without a full rewrite.

2. Lantern Library
   A magical open-air library where shelves, arches, and lanterns form the map.
   Strong for reading and dictation, but it may make English and nikud zones
   feel less distinct unless carefully separated.

3. Sky Syllable Grove
   Floating garden platforms connected by bridges of letters and syllables.
   Visually adventurous, but higher risk for movement, camera, and boundaries in
   the current prototype.

Recommended direction for the vertical slice: Word Isles. It gives the project
an original identity, supports all four current learning worlds, and can be
implemented with lightweight Three.js geometry.

## Vertical Slice Quality Bar

Before calling Issue 18 complete, the map should pass these checks:

1. First glance: it reads as a small adventure world, not a flat technical test.
2. Navigation: the player can see where to go without reading long instructions.
3. Learning clarity: each station has a different silhouette and material mood.
4. Performance: geometry stays lightweight and does not require external assets.
5. Originality: no object, layout, name, or UI element depends on copied IP.
6. Stability: existing learning tasks still open and `node tests/validate-content.js`
   passes.
