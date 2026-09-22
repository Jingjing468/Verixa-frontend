import assert from "node:assert/strict";
import test from "node:test";
import { getPublicFrontendUrl } from "./public-url.js";

const previousPublicFrontendUrl = process.env.PUBLIC_FRONTEND_URL;
const previousLowercasePublicFrontendUrl = process.env.public_frontend_url;

test.after(() => {
  if (previousPublicFrontendUrl === undefined) {
    delete process.env.PUBLIC_FRONTEND_URL;
  } else {
    process.env.PUBLIC_FRONTEND_URL = previousPublicFrontendUrl;
  }

  if (previousLowercasePublicFrontendUrl === undefined) {
    delete process.env.public_frontend_url;
  } else {
    process.env.public_frontend_url = previousLowercasePublicFrontendUrl;
  }
});

test("PUBLIC_FRONTEND_URL is trimmed and normalized", () => {
  process.env.PUBLIC_FRONTEND_URL = "  http://localhost:5173/  ";

  assert.equal(getPublicFrontendUrl(), "http://localhost:5173");
});

test("PUBLIC_FRONTEND_URL accepts quoted values", () => {
  process.env.PUBLIC_FRONTEND_URL = '"https://verixa.example.com/"';

  assert.equal(getPublicFrontendUrl(), "https://verixa.example.com");
});

test("PUBLIC_FRONTEND_URL recovers from an accidental env assignment value", () => {
  process.env.PUBLIC_FRONTEND_URL = "public_frontend_url=https://verixa.example.com/";

  assert.equal(getPublicFrontendUrl(), "https://verixa.example.com");
});

test("PUBLIC_FRONTEND_URL accepts lowercase env fallback", () => {
  delete process.env.PUBLIC_FRONTEND_URL;
  process.env.public_frontend_url = "https://verixa.example.com/";

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
