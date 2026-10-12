import process from "node:process";

const COOKIE_NAME = "__Host-unison-admin";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function configuredPassword() {
  return process.env["UNISON_ADMIN_PASSWORD"]?.trim() ?? "";
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey(password: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function passwordMatches(candidate: string, expected: string) {
  const [candidateDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const left = new Uint8Array(candidateDigest);
  const right = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return difference === 0;
}

export function isAdminConfigured() {
  return configuredPassword().length >= 24;
}

export function isSameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export async function createAdminSession(password: string) {
  const secret = configuredPassword();
  if (!isAdminConfigured() || !(await passwordMatches(password, secret))) return null;
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `unison-admin-v1:${expires}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    encoder.encode(payload),
  );
  return `${expires}.${base64Url(new Uint8Array(signature))}`;
}

export async function isAdminRequest(request: Request) {
  const secret = configuredPassword();
  if (!isAdminConfigured()) return false;
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;

  const [expiresText, encodedSignature, ...extra] = token.split(".");
  const expires = Number(expiresText);
  if (
    extra.length ||
    !encodedSignature ||
    !Number.isSafeInteger(expires) ||
    expires <= Date.now() / 1000
  )
    return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret),
      fromBase64Url(encodedSignature),
      encoder.encode(`unison-admin-v1:${expires}`),
    );
  } catch {
    return false;
  }
}

export function adminCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearedAdminCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function adminUnauthorized() {
  return Response.json(
    { error: "Admin sign-in is required." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

export function sameOriginRequired(request: Request) {
  return isSameOrigin(request)
    ? null
    : Response.json(
        { error: "Request origin was not allowed." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
}
