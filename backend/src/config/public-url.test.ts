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

const withProductionNodeEnv = (run: () => void): void => {
  const previousNodeEnv = process.env.NODE_ENV;

  process.env.NODE_ENV = "production";

  try {
    run();
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
};

test("production rejects a localhost PUBLIC_FRONTEND_URL", () => {
  withProductionNodeEnv(() => {
    process.env.PUBLIC_FRONTEND_URL = "http://localhost:5173";

    assert.throws(
      () => getPublicFrontendUrl(),
      /PUBLIC_FRONTEND_URL is misconfigured.*localhost/
    );
  });
});

test("production rejects the backend Render URL", () => {
  withProductionNodeEnv(() => {
    process.env.PUBLIC_FRONTEND_URL = "https://verixa-backend.onrender.com";

    assert.throws(
      () => getPublicFrontendUrl(),
      /PUBLIC_FRONTEND_URL is misconfigured.*Render/
    );
  });
});

test("production warns but allows a Vercel preview URL", () => {
  withProductionNodeEnv(() => {
    process.env.PUBLIC_FRONTEND_URL = "https://verixa-team-abc123.vercel.app";

    const warnings: string[] = [];
    const originalWarn = console.warn;

    console.warn = (message: string) => {
      warnings.push(message);
    };

    try {
      assert.equal(
        getPublicFrontendUrl(),
        "https://verixa-team-abc123.vercel.app"
      );
      assert.match(warnings[0] ?? "", /Vercel preview/);
    } finally {
      console.warn = originalWarn;
    }
  });
});

test("production accepts a Vercel production domain", () => {
  withProductionNodeEnv(() => {
    process.env.PUBLIC_FRONTEND_URL = "https://verixa.vercel.app";

    assert.equal(getPublicFrontendUrl(), "https://verixa.vercel.app");
  });
});

test("non-production environments allow localhost values", () => {
  delete process.env.NODE_ENV;
  process.env.PUBLIC_FRONTEND_URL = "http://localhost:5173";

  assert.equal(getPublicFrontendUrl(), "http://localhost:5173");
});
