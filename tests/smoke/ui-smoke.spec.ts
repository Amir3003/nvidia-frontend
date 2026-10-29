import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

// Screenshots go here so an agent can open them and look at the rendered UI.
const SHOTS = process.env.UI_SHOTS_DIR || "/tmp/ui-check";
mkdirSync(SHOTS, { recursive: true });

// A fixed Radar feed for the test, so the check never depends on the live scan.
const FEED = [
  {
    id: "smoke-ml-grant",
    type: "GRANT",
    title: "Smoke Test AI Research Grant",
    organization: "QADAM Smoke Test",
    deadline: "2099-01-01",
    url: "https://example.com/grant",
    eligibility: "check source",
    summary: "Fixture listing used only by the UI smoke test.",
    skills: ["PyTorch", "SQL", "AI", "Underwater Basket Weaving"],
  },
];

const PROFILE = {
  name: "Smoke",
  surname: "Tester",
  email: "smoke@example.com",
  university: "Test University",
  major: "AI & Machine Learning",
  location: "Almaty, Kazakhstan",
  role: "Student",
  skills: ["SQL", "Underwater Basket Weaving"],
  goals: [],
  isPublic: false,
  isOnboarded: true,
};

const MEMBERSHIP = {
  userId: "00000000-0000-0000-0000-000000000001",
  cohortId: "00000000-0000-0000-0000-000000000002",
  cohortName: "Smoke cohort",
  institutionName: "Smoke institution",
};

/* Collects uncaught exceptions and console errors, and serves every external host locally. */
async function watch(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") {
      if (url.pathname === "/data/opportunities.json") {
        return route.fulfill({ json: FEED });
      }
      return route.continue();
    }
    return route.fulfill({ status: 200, body: "" });
  });
  return errors;
}

async function expectRendered(page: Page) {
  // A white screen leaves #root empty; a rendered page has visible text.
  await expect(page.locator("#root")).not.toBeEmpty();
  const text = await page.locator("#root").innerText();
  expect(text.trim().length).toBeGreaterThan(40);
}

const PUBLIC_ROUTES = ["/welcome", "/student", "/staff", "/privacy", "/terms", "/refund"];

for (const route of PUBLIC_ROUTES) {
  test(`public route ${route} renders without errors`, async ({ page }, info) => {
    const errors = await watch(page);
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expectRendered(page);
    const name = `${info.project.name}${route.replace(/\//g, "-")}.png`;
    await page.screenshot({ path: path.join(SHOTS, name), fullPage: false });
    expect(errors).toEqual([]);
  });
}

test("learner opens CV gaps from the Radar and starts the matching quiz", async ({ page }, info) => {
  const errors = await watch(page);
  await page.addInitScript(
    ([profile, membership]) => {
      if (sessionStorage.getItem("smoke-seeded")) return;
      sessionStorage.setItem("smoke-seeded", "1");
      localStorage.setItem("qadam_user", JSON.stringify(profile));
      localStorage.setItem("qadam_cohort_membership", JSON.stringify(membership));
      localStorage.setItem("qadam_consent_analytics_v1", "denied");
    },
    [PROFILE, MEMBERSHIP] as const,
  );

  await page.goto("/");
  await expect(page.getByText("Smoke Test AI Research Grant").first()).toBeVisible();
  await expectRendered(page);
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-radar.png`) });

  await page.getByRole("button", { name: "Analyze CV Gaps" }).first().click();
  const gaps = page.getByRole("dialog", { name: "Smoke Test AI Research Grant" });
  await expect(gaps).toBeVisible();
  // Every skill with a quiz gets a button; the one without a quiz says so.
  await expect(gaps.getByText("No quiz yet")).toHaveCount(1);
  await expect(gaps.getByRole("button", { name: /Take Quiz|Verify & Add/ })).toHaveCount(3);
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-cv-gaps.png`) });

  // The innermost block that holds both the skill name and its button is that skill's row.
  const pytorchRow = gaps
    .locator("div")
    .filter({ has: page.getByText("PyTorch", { exact: true }) })
    .filter({ has: page.getByRole("button") })
    .last();
  await pytorchRow.getByRole("button").click();
  const quiz = page.getByRole("dialog", { name: /PyTorch/ });
  await expect(quiz).toBeVisible();
  await expect(quiz.getByText("PyTorch Verification").first()).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-quiz.png`) });

  expect(errors).toEqual([]);
});
