/**
 * SVGO configuration for the icon library.
 * Run with: npm run optimize
 * @type {import('svgo').Config}
 */
export default {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: false,
    finalNewline: true,
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Figma exports often have IDs used by masks/clipPaths; keep them safe but minified.
          cleanupIds: { minify: true },
        },
      },
    },
    // Icons must scale: drop fixed width/height and rely on viewBox.
    'removeDimensions',
    // Consistent attribute ordering keeps git diffs small.
    'sortAttrs',
  ],
};
