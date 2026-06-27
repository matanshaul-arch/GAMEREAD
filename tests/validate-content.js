"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const contentSource = fs.readFileSync("content.js", "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(contentSource, sandbox, { filename: "content.js" });

const content = sandbox.window.LEARNING_CONTENT;
assert.ok(content, "content.js must define window.LEARNING_CONTENT");
assert.ok(Array.isArray(content.worlds), "content.worlds must be an array");
assert.ok(content.challenges && typeof content.challenges === "object", "content.challenges must be an object");

const requiredChallengeFields = [
  "world",
  "title",
  "target",
  "letters",
  "answer",
  "direction",
  "rule",
  "hint",
];

const challengeIds = Object.keys(content.challenges);
assert.ok(challengeIds.length > 0, "at least one challenge is required");
assert.equal(new Set(challengeIds).size, challengeIds.length, "challenge ids must be unique");

for (const [id, challenge] of Object.entries(content.challenges)) {
  for (const field of requiredChallengeFields) {
    assert.ok(challenge[field], `${id} is missing ${field}`);
  }

  assert.ok(Array.isArray(challenge.letters), `${id}.letters must be an array`);
  assert.ok(challenge.letters.length > 0, `${id}.letters must not be empty`);
  assert.ok(Array.isArray(challenge.distractors), `${id}.distractors must be an array`);
  assert.ok(challenge.distractors.length > 0, `${id}.distractors must not be empty`);
  assert.equal(
    new Set([...challenge.letters, ...challenge.distractors]).size,
    challenge.letters.length + challenge.distractors.length,
    `${id}.letters and ${id}.distractors must not contain duplicates`
  );
  assert.ok(["rtl", "ltr"].includes(challenge.direction), `${id}.direction must be rtl or ltr`);

  if (challenge.mode === "story") {
    assert.ok(challenge.story, `${id}.story is required for story mode`);
    assert.ok(challenge.dictationPrompt, `${id}.dictationPrompt is required for story mode`);
    assert.ok(challenge.speechLang, `${id}.speechLang is required for story mode`);
  } else if (challenge.mode === "reading") {
    assert.ok(Array.isArray(challenge.passage), `${id}.passage must be an array for reading mode`);
    assert.ok(challenge.passage.length > 0, `${id}.passage must not be empty`);
    assert.ok(challenge.question, `${id}.question is required for reading mode`);
    assert.ok(Array.isArray(challenge.choices), `${id}.choices must be an array for reading mode`);
    assert.ok(challenge.choices.length >= 2, `${id}.choices must include at least two answers`);
    assert.ok(challenge.correctChoice, `${id}.correctChoice is required for reading mode`);
    assert.ok(challenge.choices.includes(challenge.correctChoice), `${id}.correctChoice must be one of choices`);
    assert.ok(Array.isArray(challenge.focusWords), `${id}.focusWords must be an array for reading mode`);
    assert.ok(challenge.speechLang, `${id}.speechLang is required for reading mode`);
  } else {
    assert.equal(challenge.target, challenge.answer, `${id}.target should match answer for word mode`);
  }
}

const worldIds = new Set();
for (const world of content.worlds) {
  assert.ok(world.id, "world id is required");
  assert.ok(!worldIds.has(world.id), `${world.id} world id is duplicated`);
  worldIds.add(world.id);
  assert.ok(world.name, `${world.id}.name is required`);
  assert.ok(world.color, `${world.id}.color is required`);
  assert.equal(typeof world.x, "number", `${world.id}.x must be a number`);
  assert.equal(typeof world.y, "number", `${world.id}.y must be a number`);
  assert.ok(Array.isArray(world.challengeIds), `${world.id}.challengeIds must be an array`);
  assert.ok(world.challengeIds.length > 0, `${world.id}.challengeIds must not be empty`);

  for (const challengeId of world.challengeIds) {
    assert.ok(content.challenges[challengeId], `${world.id} references missing challenge ${challengeId}`);
  }
}

console.log(`Validated ${content.worlds.length} worlds and ${challengeIds.length} challenges.`);
