import { createHmac, timingSafeEqual } from "node:crypto";
import { readEnv } from "@/lib/databaseEnv";

const CHALLENGE_TTL_MS = 30 * 60 * 1000;

function getMathChallengeSecret() {
  return readEnv("JWT_SECRET") ?? "bluewave-dev-math-challenge";
}

function signPayload(payload: string) {
  return createHmac("sha256", getMathChallengeSecret()).update(payload).digest("hex");
}

function randomDigit() {
  return Math.floor(Math.random() * 9) + 1;
}

export function createMathChallenge() {
  const left = randomDigit();
  const right = randomDigit();
  const issuedAt = Date.now();
  const payload = `${left}:${right}:${issuedAt}`;
  const token = `${payload}.${signPayload(payload)}`;

  return {
    question: `${left} + ${right}`,
    token,
  };
}

export function verifyMathChallenge(token: string, answer: string | number) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || signPayload(payload) !== signature) {
    return false;
  }

  const [leftRaw, rightRaw, issuedAtRaw] = payload.split(":");
  const left = Number(leftRaw);
  const right = Number(rightRaw);
  const issuedAt = Number(issuedAtRaw);

  if (!Number.isFinite(left) || !Number.isFinite(right) || !Number.isFinite(issuedAt)) {
    return false;
  }

  if (Date.now() - issuedAt > CHALLENGE_TTL_MS) {
    return false;
  }

  const expected = left + right;
  const provided = Number(String(answer).trim());

  if (!Number.isFinite(provided)) {
    return false;
  }

  const expectedBuffer = Buffer.from(String(expected));
  const providedBuffer = Buffer.from(String(provided));

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
