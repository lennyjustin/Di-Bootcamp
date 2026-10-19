import test from "node:test";
import assert from "node:assert/strict";
import {
  getAttemptState,
  getEffectiveAttempt,
  getSubmissionResult,
  normalizeEmail,
  validatePassword,
} from "./domain.js";

test("email addresses are trimmed and case-normalized", () => {
  assert.equal(normalizeEmail("  Student@Example.com "), "student@example.com");
});

test("passwords must be between 12 and 200 characters", () => {
  assert.equal(validatePassword("strong-password"), true);
  assert.equal(validatePassword("short"), false);
  assert.equal(validatePassword("x".repeat(201)), false);
});

test("a student can submit a first attempt", () => {
  assert.deepEqual(getAttemptState([], 3), { canSubmit: true, reason: null });
});

test("pending attempts block additional submissions until graded", () => {
  assert.deepEqual(
    getAttemptState([{ status: "pending" }], 3),
    { canSubmit: false, reason: "awaiting_grade" },
  );
});

test("passing an assignment closes retakes", () => {
  assert.deepEqual(
    getAttemptState([{ status: "passed" }], 3),
    { canSubmit: false, reason: "passed" },
  );
});

test("failed work can be resubmitted while attempts remain", () => {
  assert.deepEqual(
    getAttemptState([{ status: "failed" }], 3),
    { canSubmit: true, reason: "retake_available" },
  );
});

test("the attempt limit blocks further retakes", () => {
  assert.deepEqual(
    getAttemptState([{ status: "failed" }, { status: "failed" }], 2),
    { canSubmit: false, reason: "attempts_exhausted" },
  );
});

test("the highest policy selects the best graded attempt", () => {
  assert.equal(
    getEffectiveAttempt([{ score: "62" }, { score: "83" }, { score: "72" }], "highest").score,
    "83",
  );
});

test("the latest policy selects the most recent graded attempt", () => {
  assert.equal(
    getEffectiveAttempt([{ score: "62" }, { score: "83" }, { score: "72" }], "latest").score,
    "72",
  );
});

test("a score equal to the pass mark is a pass", () => {
  assert.equal(getSubmissionResult(50, 50), "passed");
  assert.equal(getSubmissionResult(49.99, 50), "failed");
});
