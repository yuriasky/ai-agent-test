# Icon Library

SVG icon library. **Figma is the source of truth**; this repo holds the optimized SVG output.

## Structure

```
icons/            Optimized SVGs, one file per icon, kebab-case names (e.g. arrow-left.svg)
scripts/          Repo tooling (name checks)
svgo.config.js    SVGO optimization settings
```

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
