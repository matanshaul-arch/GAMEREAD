# GitHub-ready task backlog

הקובץ הזה מיועד להעתקה ל-GitHub Issues לאחר יצירת repository מרוחק.

## Milestone 1: Stabilize the prototype

### Issue 1: Add automated smoke tests

Goal: verify that core game logic does not regress.

Tasks:

- [x] Add content validation for missing fields and missing challenge references.
- [ ] Test answer normalization.
- [ ] Test drag-built answer order for RTL and LTR words.
- [ ] Test that stars increase only on correct answers.
- [ ] Test that gates open after 3 successful answers.

Acceptance check:

- Running the test command reports all checks passing.

### Issue 2: Move learning content into a separate data file

Goal: make vocabulary easier to expand without editing game logic.

Tasks:

- [x] Extract `challenges` into `content.js` or JSON.
- [x] Keep Hebrew direction and English direction explicit.
- [x] Add validation for missing fields.

Acceptance check:

- [x] The game still loads all existing challenges.

### Issue 3: Improve keyboard accessibility

Goal: allow a child to play without a mouse.

Tasks:

- Add keyboard selection for letter tiles.
- Add visible focus state for all interactive controls.
- Add clear Enter/Space behavior for choosing letters.

Acceptance check:

- A full challenge can be completed with keyboard only.

### Issue 4: Add parent/teacher progress view

Goal: show what the child practiced without adding complexity to the child view.

Tasks:

- Track attempts per word.
- Track hints used.
- Track correct/incorrect attempts.
- Display a simple local summary.

Acceptance check:

- Parent view shows practiced words and weak spots.

### Issue 5: Add read-aloud story and dictation mode

Goal: support short reading passages and dictation practice.

Tasks:

- [x] Add story-mode content fields.
- [x] Add read-aloud button using browser speech synthesis.
- [x] Add dictation playback button.
- [x] Reuse typing and letter-building answer checks.
- [x] Show whether browser speech is available.
- [ ] Add tests for story-mode validation and answer behavior.
- [ ] Decide whether production audio should use browser TTS, recorded audio, or generated audio files.

Acceptance check:

- A child can hear a story, replay dictation, and type or build the dictated word.

## Milestone 2: Learning depth

### Issue 6: Expand Hebrew vocabulary set

Goal: grow from 4 Hebrew words to 20 structured words.

Tasks:

- Group words by letters and nikud patterns.
- Avoid mixing too many rules in one lesson.
- Add simple rule text for each group.

Acceptance check:

- Every word has target, letter chunks, answer, rule, and hint.

### Issue 7: Expand English phonics content

Goal: add more CVC words and short vowel practice.

Tasks:

- Add words for a/e/i/o/u short vowels.
- Group by vowel.
- Add kid-friendly phonics rule text.

Acceptance check:

- Each vowel has at least 5 words.

### Issue 8: Add level selection

Goal: avoid one-size-fits-all difficulty.

Tasks:

- Add levels for ages 4-5, 6-7, 7-8.
- Gate typing-heavy tasks behind older levels.
- Keep drag-based tasks available for younger players.

Acceptance check:

- Selected level changes available tasks.

## Milestone 3: Game world

### Issue 9: Add theme packs

Goal: support different child interests without copying protected IP.

Tasks:

- Create original theme options: magic school, space, animals, ocean.
- Keep learning mechanics identical across themes.
- Separate visual theme from educational content.
- Keep visual inspiration generic; do not copy Matific or other branded assets.

Acceptance check:

- Theme can be switched without changing challenge answers.

### Issue 10: Add simple NPC guide

Goal: make instructions clearer for independent play.

Tasks:

- Add a friendly guide character.
- Give one-sentence prompts before each challenge.
- Avoid long text blocks.

Acceptance check:

- A new player understands what to do in the first minute.

### Issue 11: Add local progress persistence

Goal: keep stars and completed gates after refresh.

Tasks:

- Store progress in `localStorage`.
- Add reset progress button for parents.
- Avoid storing personal information.

Acceptance check:

- Refreshing the page keeps non-sensitive progress.

### Issue 12: Create a 3D technical prototype

Goal: prove that a small Three.js scene can run reliably before replacing the 2D map.

Tasks:

- [x] Create one 3D room or courtyard.
- [x] Add one original player character placeholder.
- [x] Support keyboard movement.
- [x] Keep the learning panel outside the 3D scene for the first version.
- [x] Verify desktop framing and nonblank canvas.
- [ ] Verify mobile framing.
- [x] Add station proximity cues.
- [ ] Improve camera smoothing.
- [ ] Replace placeholder character with designed original character.

Acceptance check:

- The 3D scene is nonblank, interactive, shows nearby station prompts, and does not break existing learning tasks.

### Issue 13: Character design specification

Goal: define the player character before building final assets.

Tasks:

- Choose character role, name, colors, and accessories.
- Avoid protected brands and copied character designs.
- Define 3 states: idle, walking, learning.
- Keep a simple low-poly version for the prototype.

Acceptance check:

- Character spec is clear enough to build or generate original assets.

## Security and privacy tasks

### Issue 14: Document child privacy boundaries

Goal: make clear what data is and is not collected.

Tasks:

- State that the prototype sends no data to a server.
- Avoid names, photos, voice recordings, or personal identifiers.
- If future online sync is added, require explicit privacy review first.

Acceptance check:

- README includes privacy note.

### Issue 15: Add content safety review process

Goal: avoid inappropriate or legally risky content.

Tasks:

- Do not use protected brands or characters.
- Keep theme names original.
- Review all vocabulary and feedback text before release.

Acceptance check:

- New content additions include a short safety checklist.
