# Icon Library

SVG icon library. **Figma is the source of truth**; this repo holds the optimized SVG output.

## Structure

```
icons/            Optimized SVGs, one file per icon, kebab-case names (e.g. arrow-left.svg)
scripts/          Repo tooling (name checks)
svgo.config.js    SVGO optimization settings
icons.manifest.json  Fingerprint of each icon's raw Figma export (name, node id, hash)
```

## Preview

```sh
npm run preview
```

Builds `preview/index.html` (not committed): a self-contained page showing every icon in `icons/`,
grouped by Figma category, with search, size/color/theme controls, a 24px grid overlay and per-icon details.
It's a snapshot — rebuild it after icons change.

## Change detection

`icons.manifest.json` stores an FNV-1a hash (`scripts/fingerprint.js`) of every icon's **raw** Figma SVG export.
A sync first asks Figma only for names + hashes, then runs:

```sh
node scripts/compare-fingerprints.js fingerprints.tsv          # report added / changed / removed
node scripts/compare-fingerprints.js fingerprints.tsv --write  # update the manifest after syncing
```

Only added and changed icons are exported and optimized. Removed icons are reported, never deleted automatically.

## Workflow: adding or updating an icon

1. Check the Figma file for new or changed icons.
2. Export the icon as SVG from Figma.
3. Save it to `icons/<icon-name>.svg` using **kebab-case** (`Arrow Left` → `arrow-left.svg`).
   New icon → new file. Changed icon → overwrite the existing file.
4. Optimize and validate:
   ```sh
   npm run check
   ```
5. Commit with a message describing the change, e.g. `feat(icons): add arrow-left` or `fix(icons): update search stroke width`.
6. Push to the remote.

## Setup

```sh
npm install
```
