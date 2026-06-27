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

## Milestone 2: Learning depth

### Issue 5: Expand Hebrew vocabulary set

Goal: grow from 4 Hebrew words to 20 structured words.

Tasks:

- Group words by letters and nikud patterns.
- Avoid mixing too many rules in one lesson.
- Add simple rule text for each group.

Acceptance check:

- Every word has target, letter chunks, answer, rule, and hint.

### Issue 6: Expand English phonics content

Goal: add more CVC words and short vowel practice.

Tasks:

- Add words for a/e/i/o/u short vowels.
- Group by vowel.
- Add kid-friendly phonics rule text.

Acceptance check:

- Each vowel has at least 5 words.

### Issue 7: Add level selection

Goal: avoid one-size-fits-all difficulty.

Tasks:

- Add levels for ages 4-5, 6-7, 7-8.
- Gate typing-heavy tasks behind older levels.
- Keep drag-based tasks available for younger players.

Acceptance check:

- Selected level changes available tasks.

## Milestone 3: Game world

### Issue 8: Add theme packs

Goal: support different child interests without copying protected IP.

Tasks:

- Create original theme options: magic school, space, animals, ocean.
- Keep learning mechanics identical across themes.
- Separate visual theme from educational content.

Acceptance check:

- Theme can be switched without changing challenge answers.

### Issue 9: Add simple NPC guide

Goal: make instructions clearer for independent play.

Tasks:

- Add a friendly guide character.
- Give one-sentence prompts before each challenge.
- Avoid long text blocks.

Acceptance check:

- A new player understands what to do in the first minute.

### Issue 10: Add local progress persistence

Goal: keep stars and completed gates after refresh.

Tasks:

- Store progress in `localStorage`.
- Add reset progress button for parents.
- Avoid storing personal information.

Acceptance check:

- Refreshing the page keeps non-sensitive progress.

## Security and privacy tasks

### Issue 11: Document child privacy boundaries

Goal: make clear what data is and is not collected.

Tasks:

- State that the prototype sends no data to a server.
- Avoid names, photos, voice recordings, or personal identifiers.
- If future online sync is added, require explicit privacy review first.

Acceptance check:

- README includes privacy note.

### Issue 12: Add content safety review process

Goal: avoid inappropriate or legally risky content.

Tasks:

- Do not use protected brands or characters.
- Keep theme names original.
- Review all vocabulary and feedback text before release.

Acceptance check:

- New content additions include a short safety checklist.
