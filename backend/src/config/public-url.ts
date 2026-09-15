export const getPublicFrontendUrl = (): string => {
  const publicFrontendUrl = process.env.PUBLIC_FRONTEND_URL;

  if (!publicFrontendUrl) {
    throw new Error("PUBLIC_FRONTEND_URL environment variable is required");
  }

  try {
    const url = new URL(publicFrontendUrl);

    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error("PUBLIC_FRONTEND_URL must be a valid URL");
  }
};
