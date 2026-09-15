export type DatabaseUserRole = "organization_admin" | "issuer" | "viewer";
export type ApiUserRole = "admin" | "issuer" | "viewer";

export type AuthenticatedUser = {
  id: string;
  fullName: string;
  email: string;
  role: ApiUserRole;
  organizationId: string;
};

export type JwtUserPayload = AuthenticatedUser;

export type OrganizationSummary = {
  id: string;
  name: string;
  email: string;
  logoUrl: string | null;
};
