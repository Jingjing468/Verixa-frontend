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
