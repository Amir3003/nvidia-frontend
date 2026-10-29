import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

// Runs against the deployed site with the real Radar feed. Supabase calls are answered
// inside the browser with a test learner, so nothing is read from or written to the database.
const SHOTS = process.env.UI_SHOTS_DIR || "/tmp/ui-check";
mkdirSync(SHOTS, { recursive: true });

const USER_ID = "00000000-0000-0000-0000-0000000000aa";

const PROFILE = {
  name: "Live",
  surname: "Check",
  email: "live-check@example.com",
  university: "Test University",
  major: "AI & Machine Learning",
  location: "Almaty, Kazakhstan",
  role: "Student",
  skills: [],
  goals: [],
  isPublic: false,
  isOnboarded: true,
};

function fakeSession() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: USER_ID, exp, role: "authenticated" })).toString("base64url");
  const user = { id: USER_ID, aud: "authenticated", role: "authenticated", email: PROFILE.email, app_metadata: {}, user_metadata: {} };
  return { access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.test`, refresh_token: "test", expires_in: 3600, expires_at: exp, token_type: "bearer", user };
}

test("live Radar loads the real feed and the AI skill opens the Machine Learning quiz", async ({ page, request }) => {
  const feedResponse = await request.get("/data/opportunities.json");
  expect(feedResponse.ok()).toBeTruthy();
  const feedJson = await feedResponse.json();
  const feed: { title: string; skills?: string[]; deadline: string | null }[] = Array.isArray(feedJson) ? feedJson : feedJson.results;
  const today = new Date().toISOString().slice(0, 10);
  const current = feed.filter((o) => o.deadline && o.deadline >= today);
  expect(current.length, "the live feed has no listing with a future deadline").toBeGreaterThan(0);
  const aiListing = current.find((o) => (o.skills || []).some((s) => s.trim().toLowerCase() === "ai"));

  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });
  await page.route(/\.supabase\.co\//, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/cohort_learners")) {
      return route.fulfill({ json: [{ cohort_id: "live-check", joined_at: today, cohorts: { name: "Live check", institutions: { name: "Live check" } } }] });
    }
    if (route.request().method() === "GET") return route.fulfill({ json: [] });
    return route.fulfill({ status: 201, body: "" });
  });
  await page.addInitScript(
    ([profile, session, userId]) => {
      if (sessionStorage.getItem("live-seeded")) return;
      sessionStorage.setItem("live-seeded", "1");
      localStorage.setItem("qadam_user", JSON.stringify(profile));
      localStorage.setItem("qadam_cohort_membership", JSON.stringify({ userId, cohortId: "live-check", cohortName: "Live check", institutionName: "Live check" }));
      localStorage.setItem("qadam-network-auth", JSON.stringify(session));
      localStorage.setItem("qadam_consent_analytics_v1", "denied");
    },
    [PROFILE, fakeSession(), USER_ID] as const,
  );

  await page.goto("/");
  await expect(page.getByText(current[0].title).first()).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "live-radar.png") });

  test.skip(!aiListing, "no current live listing has the AI skill");
  const card = page.locator("article, div").filter({ has: page.getByText(aiListing!.title, { exact: true }) }).filter({ has: page.getByRole("button", { name: "Analyze CV Gaps" }) }).last();
  await card.getByRole("button", { name: "Analyze CV Gaps" }).click();
  const gaps = page.getByRole("dialog", { name: aiListing!.title });
  await expect(gaps).toBeVisible();
  const aiRow = gaps.locator("div").filter({ has: page.getByText("AI", { exact: true }) }).filter({ has: page.getByRole("button") }).last();
  await aiRow.getByRole("button").click();
  await expect(page.getByRole("dialog", { name: /Machine Learning/ })).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "live-quiz.png") });

  expect(errors).toEqual([]);
});
