/**
 * Authentication helpers for tests
 * @module tests/helpers/auth
 */

/**
 * Get admin session cookie by logging in
 */
export async function getAdminCookie(): Promise<string> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required");
  }

  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.status} ${response.statusText}`);
  }

  // Extract cookie from response headers
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No set-cookie header in response");
  }

  return setCookie;
}
