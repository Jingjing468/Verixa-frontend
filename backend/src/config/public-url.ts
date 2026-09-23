const localhostHostPattern =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1|.*\.local)$/i;
const backendRenderHostPattern = /\.onrender\.com$/i;

/**
 * Vercel production domains are `<project>.vercel.app`; preview deployments
 * look like `<project>-<hash>-<team>.vercel.app` or
 * `<project>-git-<branch>-<team>.vercel.app`. Detect those extra segments so
 * a preview URL can be flagged without rejecting legitimate project domains.
 */
const isVercelPreviewHost = (hostname: string): boolean => {
  if (!hostname.toLowerCase().endsWith(".vercel.app")) {
    return false;
  }

  const projectPart = hostname.slice(0, -".vercel.app".length);

  return /(^|[.-])git-/.test(projectPart) || projectPart.split("-").length >= 3;
};

const assertDeployableFrontendHost = (url: URL): void => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const hostname = url.hostname.toLowerCase();
  const localhostMatch = localhostHostPattern.test(hostname);
  const backendMatch = backendRenderHostPattern.test(hostname);
  const previewMatch = isVercelPreviewHost(hostname);

  if (!localhostMatch && !backendMatch && !previewMatch) {
    return;
  }

  const problem = localhostMatch
    ? "a localhost address"
    : backendMatch
      ? "the backend Render URL instead of the frontend"
      : "a temporary Vercel preview deployment URL";

  const message = `PUBLIC_FRONTEND_URL is misconfigured: ${url.host} looks like ${problem}. Certificate QR codes and verification links would be broken. Set PUBLIC_FRONTEND_URL to the deployed frontend URL (e.g. https://your-frontend.vercel.app).`;

  if (previewMatch) {
    console.warn(message);

    return;
  }

  throw new Error(message);
};

export const getPublicFrontendUrl = (): string => {
  const publicFrontendUrl = (
    process.env.PUBLIC_FRONTEND_URL ?? process.env.public_frontend_url
  )?.trim();

  if (!publicFrontendUrl) {
    throw new Error("PUBLIC_FRONTEND_URL environment variable is required");
  }

  const unquotedPublicFrontendUrl = publicFrontendUrl.replace(
    /^(['"])(.*)\1$/,
    "$2"
  );
  const withoutEnvAssignment = unquotedPublicFrontendUrl.replace(
    /^public_frontend_url\s*=\s*/i,
    ""
  );
  const normalizedPublicFrontendUrl = /^[a-z][a-z\d+\-.]*:\/\//i.test(
    withoutEnvAssignment
  )
    ? withoutEnvAssignment
    : `http://${withoutEnvAssignment}`;

  let url: URL;

  try {
    url = new URL(normalizedPublicFrontendUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
  } catch {
    throw new Error("PUBLIC_FRONTEND_URL must be a valid URL");
  }

  assertDeployableFrontendHost(url);

  return url.toString().replace(/\/$/, "");
};
