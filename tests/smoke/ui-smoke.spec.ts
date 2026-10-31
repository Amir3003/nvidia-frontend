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

const PUBLIC_ROUTES = ["/welcome", "/students", "/start", "/student", "/staff", "/privacy", "/terms", "/refund"];

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

test("learner without skills sees a readable welcome banner on the Radar", async ({ page }, info) => {
  const errors = await watch(page);
  await page.addInitScript(
    ([profile, membership]) => {
      if (sessionStorage.getItem("smoke-seeded")) return;
      sessionStorage.setItem("smoke-seeded", "1");
      localStorage.setItem("qadam_user", JSON.stringify(profile));
      localStorage.setItem("qadam_cohort_membership", JSON.stringify(membership));
      localStorage.setItem("qadam_consent_analytics_v1", "denied");
    },
    [{ ...PROFILE, skills: [] }, MEMBERSHIP] as const,
  );

  await page.goto("/");
  const title = page.getByText("Welcome to QADAM Opportunity Radar");
  await expect(title).toBeVisible();
  await expect(page.getByRole("link", { name: "Configure Stack" })).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-radar-banner.png`) });
  expect(errors).toEqual([]);
});

test("the audience switch moves between the schools and students landings", async ({ page }, info) => {
  const errors = await watch(page);
  await page.goto("/welcome");
  const audience = page.getByRole("navigation", { name: "Choose your audience" });
  await expect(audience).toBeVisible();
  await audience.getByRole("link", { name: "For Students" }).click();
  await expect(page).toHaveURL(/\/students$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find grants, hackathons and scholarships");
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-students-landing.png`) });
  await page.getByRole("navigation", { name: "Choose your audience" }).getByRole("link", { name: "For Schools" }).click();
  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Opportunity and career support for your cohort");
  expect(errors).toEqual([]);
});

test("a student signs up for free without an invite code and lands on the Radar", async ({ page }, info) => {
  const errors = await watch(page);
  await page.addInitScript(() => localStorage.setItem("qadam_consent_analytics_v1", "denied"));
  await page.goto("/students");
  await page.getByRole("button", { name: "Start free" }).first().click();
  await expect(page).toHaveURL(/\/start$/);
  const wizard = page.getByRole("dialog", { name: "Create Your QADAM Account" });
  await expect(wizard).toBeVisible();
  // Modals close only through their visible button.
  await page.keyboard.press("Escape");
  await expect(wizard).toBeVisible();

  await wizard.getByPlaceholder("First name").fill("Aigerim");
  await wizard.getByPlaceholder("Last name").fill("Student");
  await wizard.getByRole("button", { name: "Continue" }).click();
  await wizard.getByPlaceholder("student@university.edu").fill("aigerim@example.com");
  await wizard.getByPlaceholder("University Name").fill("Test University");
  await wizard.getByPlaceholder("AI & Machine Learning").fill("AI & Machine Learning");
  await wizard.getByPlaceholder("e.g. Almaty, Kazakhstan").fill("Almaty, Kazakhstan");
  await wizard.getByRole("button", { name: "Continue" }).click();
  await wizard.getByPlaceholder("••••••••••••").nth(0).fill("Secure#Pass1");
  await wizard.getByPlaceholder("••••••••••••").nth(1).fill("Secure#Pass1");
  await wizard.getByRole("button", { name: "Continue" }).click();
  await wizard.getByPlaceholder(/Start typing a skill/).fill("Python");
  await wizard.getByRole("option", { name: /Python/ }).first().click();
  // Escape closes only the suggestion list, not the dialog.
  await wizard.getByPlaceholder(/Start typing a skill/).press("Escape");
  await expect(wizard).toBeVisible();
  await wizard.getByRole("button", { name: "MEXT Scholarship (Japan)" }).click();
  await wizard.getByRole("button", { name: "University Admissions Abroad" }).click();
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-start-goals.png`) });
  await wizard.getByRole("button", { name: "Launch QADAM Dashboard" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Opportunity Radar" })).toBeVisible();
  const membership = await page.evaluate(() => localStorage.getItem("qadam_cohort_membership"));
  expect(membership).toBeNull();
  expect(errors).toEqual([]);
});

test("the feedback widget sends a report and closes only with its button", async ({ page }, info) => {
  const errors = await watch(page);
  let sent: Record<string, unknown> | null = null;
  await page.route("**/api/feedback", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { status: "ok" } });
  });
  await page.addInitScript(
    (profile) => {
      if (sessionStorage.getItem("smoke-seeded")) return;
      sessionStorage.setItem("smoke-seeded", "1");
      localStorage.setItem("qadam_user", JSON.stringify(profile));
      localStorage.setItem("qadam_consent_analytics_v1", "denied");
    },
    PROFILE,
  );

  // A profile without a cohort is enough to use the app.
  await page.goto("/cv");
  await expect(page).toHaveURL(/\/cv$/);
  await page.getByRole("button", { name: "Send feedback" }).click();
  const dialog = page.getByRole("dialog", { name: "Send feedback" });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-feedback-open.png`) });

  await page.keyboard.press("Escape");
  await page.mouse.click(4, 4);
  await expect(dialog).toBeVisible();

  const submit = dialog.getByRole("button", { name: "Send feedback" });
  await expect(submit).toBeDisabled();
  await dialog.getByRole("radio", { name: "Bug" }).click();
  await dialog.getByRole("textbox").fill("The quiz button does nothing on my phone.");
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(dialog.getByText("Thank you. We read every report.")).toBeVisible();
  expect(sent).toMatchObject({ type: "bug", description: "The quiz button does nothing on my phone.", pageUrl: "/cv", website: "" });
  await page.screenshot({ path: path.join(SHOTS, `${info.project.name}-feedback-sent.png`) });
  await dialog.getByRole("button", { name: "Close", exact: true }).first().click();
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test("the feedback widget offers email when the service is unavailable", async ({ page }) => {
  await watch(page);
  await page.route("**/api/feedback", (route) => route.fulfill({ status: 503, json: { status: "error" } }));
  await page.addInitScript(
    (profile) => {
      localStorage.setItem("qadam_user", JSON.stringify(profile));
      localStorage.setItem("qadam_consent_analytics_v1", "denied");
    },
    PROFILE,
  );
  await page.goto("/cv");
  await page.getByRole("button", { name: "Send feedback" }).click();
  const dialog = page.getByRole("dialog", { name: "Send feedback" });
  await dialog.getByRole("textbox").fill("Please add a dark mode toggle.");
  await dialog.getByRole("button", { name: "Send feedback" }).click();
  await expect(dialog.getByRole("link", { name: "Send it by email instead" })).toBeVisible();
});
