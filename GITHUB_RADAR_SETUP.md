# QADAM radar without a VM

The public Vercel site reads `public/data/opportunities.json`. It starts as an
empty list, not the sample opportunities from `src/db/opportunities.ts`.
GitHub Actions runs the existing Tavily/Nebius scanner daily at 06:17 UTC
(11:17 in Kazakhstan UTC+5) and commits only validated public results.
Vercel's Git integration should deploy the new commit on the production branch.
The Refresh Results button reloads the published file; it does not run a scan
or use API credits.

## Finish setup on GitHub

1. Merge the code into the repository's default branch (`main`). Scheduled
   workflows run from the default branch.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions**.
   Under **Repository secrets**, create `TAVILY_API_KEY` and `NEBIUS_API_KEY`
   with the respective private values. Never put keys in `public/`, a
   `VITE_` variable, a commit, or a chat. If the model in the scanner is not
   enabled on the Nebius account, change `NEBIUS_MODEL` in the workflow's
   scan step to the available model.
3. In **Settings → Actions → General → Workflow permissions**, allow GitHub
   Actions to write repository contents if that setting is currently
   read-only. The workflow requests `contents: write` and needs it to commit
   the new JSON. Branch protection may also block the push; if it does, use a
   reviewed PR for generated updates or configure an allowed publishing path.
4. Open **Actions → Publish sourced radar → Run workflow** on `main`.
   Watch the run: a successful scan creates a commit named
   `Update sourced radar data`. Check the new `public/data/opportunities.json`
   for real source URLs and then check the Vercel production deployment.
   If the scan produces no valid results, it fails and keeps the previous
   published file. Re-running it spends Tavily/Nebius API credits.

The schedule can run late; GitHub does not promise exact cron timing. This
workflow covers the website radar only. Telegram polling and Discord Gateway
still require their own running processes or a separate bot redesign.
