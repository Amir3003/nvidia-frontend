import { test, expect, type BrowserContext } from "@playwright/test";

// UI contract tests use mocked Supabase HTTP; database authorization is tested
// separately in network-db.test.mjs against real Postgres policies.
test("a fresh device can verify email, accept an invite, and exchange messages", async ({
  browser,
}) => {
  const ids = [
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
  ];
  const code = "a".repeat(64);
  const profiles: Record<string, unknown>[] = [];
  const messages: Record<string, unknown>[] = [];
  let connected = false;
  const contexts: BrowserContext[] = [];
  async function device(index: number) {
    const context = await browser.newContext();
    contexts.push(context);
    await context.route("https://qadam-test.supabase.co/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      let data: unknown = {};
      if (url.pathname.endsWith("/otp")) data = {};
      else if (url.pathname.endsWith("/verify")) {
        const user = {
          id: ids[index],
          aud: "authenticated",
          role: "authenticated",
          email: `user${index}@example.com`,
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
        };
        const payload = Buffer.from(
          JSON.stringify({
            sub: user.id,
            exp: Math.floor(Date.now() / 1000) + 3600,
            role: "authenticated",
          }),
        ).toString("base64url");
        data = {
          access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.test`,
          refresh_token: "refresh",
          expires_in: 3600,
          token_type: "bearer",
          user,
        };
      } else if (url.pathname.endsWith("/network_profiles")) {
        if (request.method() === "POST") {
          const p = request.postDataJSON();
          const old = profiles.findIndex((row) => row.id === p.id);
          if (old >= 0) profiles[old] = p;
          else profiles.push(p);
          data = null;
        } else if (url.searchParams.has("id"))
          data = profiles.find((p) => p.id === ids[index]) || null;
        else data = profiles;
      } else if (url.pathname.endsWith("/network_connections"))
        data = connected ? [{ user_a: ids[0], user_b: ids[1] }] : [];
      else if (
        url.pathname.endsWith("/network_teams") ||
        url.pathname.endsWith("/network_members")
      )
        data = [];
      else if (url.pathname.endsWith("/network_create_invite")) data = code;
      else if (url.pathname.endsWith("/network_preview_invite"))
        data = {
          creator: "Alice",
          team: null,
          expires_at: "2099-01-01T00:00:00Z",
        };
      else if (url.pathname.endsWith("/network_accept_invite")) {
        connected = true;
        data = { connected_to: ids[0], team_id: null };
      } else if (url.pathname.endsWith("/network_messages")) {
        if (request.method() === "POST") {
          const m = {
            ...request.postDataJSON(),
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          };
          messages.push(m);
          data = m;
        } else data = [...messages].reverse();
      }
      await route.fulfill({
        status: 200,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
        },
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    });
    return context.newPage();
  }
  try {
    const a = await device(0);
    await a.goto("/network");
    await a.getByLabel("Email", { exact: true }).fill("alice@example.com");
    await a.getByRole("button", { name: "Send sign-in code" }).click();
    await a.getByLabel("Code from your email").fill("123456");
    await a.getByRole("button", { name: "Verify and continue" }).click();
    await a.getByLabel("Name", { exact: true }).fill("Alice");
    await a.getByRole("button", { name: "Save network profile" }).click();
    await a.getByRole("button", { name: "Create connection link" }).click();
    await expect(a.getByLabel("Invitation link")).toHaveValue(
      `http://127.0.0.1:5178/join#code=${code}`,
    );
    const b = await device(1);
    await b.goto(`/join#code=${code}`);
    await expect(
      b.getByRole("heading", { name: "Sign in to the shared network" }),
    ).toBeVisible();
    await b.getByLabel("Email", { exact: true }).fill("bob@example.com");
    await b.getByRole("button", { name: "Send sign-in code" }).click();
    await b.getByLabel("Code from your email").fill("123456");
    await b.getByRole("button", { name: "Verify and continue" }).click();
    await expect(
      b.getByRole("button", { name: "Accept invitation" }),
    ).toBeDisabled();
    await b.getByLabel("Name", { exact: true }).fill("Bob");
    await b.getByRole("button", { name: "Save network profile" }).click();
    await b.getByRole("button", { name: "Accept invitation" }).click();
    await b.getByRole("button", { name: "Open network", exact: true }).click();
    await expect(b).toHaveURL(/\/network$/);
    await a.getByRole("button", { name: "Refresh", exact: true }).click();
    await a.getByRole("button", { name: "Message", exact: true }).click();
    await a
      .getByLabel("Message", { exact: true })
      .fill("Hello from another device");
    await a.getByRole("button", { name: "Send", exact: true }).click();
    await b.getByRole("button", { name: "Message", exact: true }).click();
    await expect(
      b.getByText("Hello from another device", { exact: true }),
    ).toBeVisible();
    await expect(
      b.getByText(/Acknowledged!|Thanks for connecting/),
    ).toHaveCount(0);
  } finally {
    for (const context of contexts) await context.close();
  }
});

test("invalid invite stays on the join page instead of redirecting to welcome", async ({
  page,
}) => {
  await page.goto("/join?code=bad");
  await expect(
    page.getByRole("heading", { name: "Invalid invitation" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/join\?code=bad$/);
});
