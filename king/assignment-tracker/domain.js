export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validatePassword(value) {
  return typeof value === "string" && value.length >= 12 && value.length <= 200;
}

export function getAttemptState(attempts, maxAttempts) {
  if (!attempts.length) {
    return { canSubmit: true, reason: null };
  }

  const latest = attempts.at(-1);
  if (latest.status === "pending") {
    return { canSubmit: false, reason: "awaiting_grade" };
  }
  if (latest.status === "passed") {
    return { canSubmit: false, reason: "passed" };
  }
  if (attempts.length >= maxAttempts) {
    return { canSubmit: false, reason: "attempts_exhausted" };
  }

  return { canSubmit: true, reason: "retake_available" };
}

export function getEffectiveAttempt(attempts, scorePolicy) {
  const gradedAttempts = attempts.filter((attempt) => attempt.score !== null);
  if (!gradedAttempts.length) return null;

  if (scorePolicy === "highest") {
    return gradedAttempts.reduce((best, attempt) =>
      Number(attempt.score) > Number(best.score) ? attempt : best,
    );
  }

  return gradedAttempts.at(-1);
}

export function getSubmissionResult(score, passMark) {
  return Number(score) >= Number(passMark) ? "passed" : "failed";
}
