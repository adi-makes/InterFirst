import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyValues,
  DRAFT_LIFETIME_MS,
  isDraftCurrent,
  validateStep,
} from "../src/careers/applicationModel.js";

test("validates required personal, work, and about fields", () => {
  const values = createEmptyValues();

  assert.deepEqual(Object.keys(validateStep(1, values)), ["name"]);
  assert.deepEqual(Object.keys(validateStep(2, values)), ["email"]);
  assert.deepEqual(Object.keys(validateStep(3, values)), ["evidenceType"]);
  assert.deepEqual(Object.keys(validateStep(4, values)), ["evidenceUrl"]);
  assert.deepEqual(Object.keys(validateStep(6, values)), ["answer"]);
});

test("accepts complete synthetic application values", () => {
  const values = {
    ...createEmptyValues(),
    name: "Avery Example",
    email: "avery@example.test",
    evidenceType: "Portfolio",
    evidenceUrl: "https://example.test/work",
    answer: "A synthetic answer about a useful decision.",
  };

  assert.deepEqual(validateStep(1, values), {});
  assert.deepEqual(validateStep(2, values), {});
  assert.deepEqual(validateStep(3, values), {});
  assert.deepEqual(validateStep(4, values), {});
  assert.deepEqual(validateStep(6, values), {});
});

test("rejects expired and mismatched drafts", () => {
  const current = Date.now();
  const draft = {
    schemaVersion: 2,
    role: "developer",
    step: 6,
    updatedAt: new Date(current - 1000).toISOString(),
    values: createEmptyValues(),
  };

  assert.equal(isDraftCurrent(draft, "developer", current), true);
  assert.equal(isDraftCurrent(draft, "designer", current), false);
  assert.equal(
    isDraftCurrent(
      {
        ...draft,
        updatedAt: new Date(current - DRAFT_LIFETIME_MS - 1).toISOString(),
      },
      "developer",
      current,
    ),
    false,
  );
});
