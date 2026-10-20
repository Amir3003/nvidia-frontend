---
name: handoff
description: Writes a compact brief so work can continue in a fresh chat. Use when the user asks for a handoff, when a session has become long or slow, or before switching to a new chat.
---

# Handoff brief

Produce one brief the user can paste into a new chat. Base it only on what happened in this session; do not invent progress.

Format, in the user's language:

1. **Goal**: what the user is trying to achieve, one or two sentences.
2. **Done**: finished and verified work, with PR links and file paths.
3. **Decisions**: choices already made that should not be re-litigated.
4. **In progress**: anything started but not finished, and its exact state (branch, uncommitted files, failing checks).
5. **Next steps**: ordered list, marking which ones the user must do in a browser.
6. **Constraints**: rules that matter for the next steps (from `CLAUDE.md` and the user's requests).

Keep it under about 40 lines. Before writing it, make sure work is committed and pushed, and update "Project State" in `CLAUDE.md` if something durable changed.
