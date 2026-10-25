# Rollback Plan — 2026 Redesign

Snapshot of the original site (before any redesign change):

| Item | Location |
|---|---|
| Git tag | `pre-redesign-2026-10-25` (commit `b1e42b5`) |
| Full-history git bundle | `C:\Users\sajja\Backups\sajjad-portfolio\2026-10-25\repo-full-history.bundle` |
| Source snapshot (zip of tag) | `C:\Users\sajja\Backups\sajjad-portfolio\2026-10-25\source-snapshot.zip` |
| Live build archive (`dist/`, 919 MB) | `C:\Users\sajja\Backups\sajjad-portfolio\2026-10-25\live-build-dist.zip` |
| Raw new-project files | `H:\Temp Work\TEMP` (never modified by the pipeline) |

Deployment facts: GitHub Pages deploys **only from `main`** (environment branch policy), custom domain `sajjad-studio.com`. Every push to `main` redeploys automatically (~2–3 min).

All redesign work happens on branch `redesign-2026`. Until it is merged, the live site is untouched and no rollback is needed.

## Option A — Undo the merge (recommended, keeps history)
```bash
git switch main
git pull
git revert -m 1 <merge-commit-sha>
git push origin main
```
GitHub Actions redeploys the original site automatically.

## Option B — Hard restore main to the snapshot tag (instant, rewrites main)
```bash
git switch main
git reset --hard pre-redesign-2026-10-25
git push --force-with-lease origin main
```
Use only if Option A conflicts. The redesign stays safe on branch `redesign-2026`.

## Option C — Disaster recovery (repo lost or corrupted)
```bash
git clone "C:/Users/sajja/Backups/sajjad-portfolio/2026-10-25/repo-full-history.bundle" sajjad-portfolio-restored
cd sajjad-portfolio-restored
git checkout pre-redesign-2026-10-25
pnpm install
pnpm build
```
Then push to GitHub (`git remote set-url origin https://github.com/mit4o4/sajjad-portfolio.git`) or serve `dist/` directly. If even the build fails, unzip `live-build-dist.zip`: it is the exact deployed site and can be uploaded to any static host as-is.

## Verification after rollback
1. Actions tab → "Deploy to GitHub Pages" run succeeds.
2. https://sajjad-studio.com shows the old hero ("+200 projects") and the single-page layout.
