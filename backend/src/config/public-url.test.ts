import assert from "node:assert/strict";
import test from "node:test";
import { getPublicFrontendUrl } from "./public-url.js";

const previousPublicFrontendUrl = process.env.PUBLIC_FRONTEND_URL;

test.after(() => {
  if (previousPublicFrontendUrl === undefined) {
    delete process.env.PUBLIC_FRONTEND_URL;
    return;
  }

  process.env.PUBLIC_FRONTEND_URL = previousPublicFrontendUrl;
});

test("PUBLIC_FRONTEND_URL is trimmed and normalized", () => {
  process.env.PUBLIC_FRONTEND_URL = "  http://localhost:5173/  ";

  assert.equal(getPublicFrontendUrl(), "http://localhost:5173");
});

test("PUBLIC_FRONTEND_URL accepts quoted values", () => {
  process.env.PUBLIC_FRONTEND_URL = '"https://verixa.example.com/"';

  assert.equal(getPublicFrontendUrl(), "https://verixa.example.com");
});

test("PUBLIC_FRONTEND_URL defaults localhost-style values to http", () => {
  process.env.PUBLIC_FRONTEND_URL = "localhost:5173";

  assert.equal(getPublicFrontendUrl(), "http://localhost:5173");
});

test("PUBLIC_FRONTEND_URL rejects unsupported protocols", () => {
  process.env.PUBLIC_FRONTEND_URL = "javascript:alert(1)";

  assert.throws(
    () => getPublicFrontendUrl(),
    /PUBLIC_FRONTEND_URL must be a valid URL/
  );
});
