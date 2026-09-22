export const getPublicFrontendUrl = (): string => {
  const publicFrontendUrl = process.env.PUBLIC_FRONTEND_URL?.trim();

  if (!publicFrontendUrl) {
    throw new Error("PUBLIC_FRONTEND_URL environment variable is required");
  }

  const unquotedPublicFrontendUrl = publicFrontendUrl.replace(
    /^(['"])(.*)\1$/,
    "$2"
  );
  const normalizedPublicFrontendUrl = /^[a-z][a-z\d+\-.]*:\/\//i.test(
    unquotedPublicFrontendUrl
  )
    ? unquotedPublicFrontendUrl
    : `http://${unquotedPublicFrontendUrl}`;

  try {
    const url = new URL(normalizedPublicFrontendUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error("PUBLIC_FRONTEND_URL must be a valid URL");
  }
};
