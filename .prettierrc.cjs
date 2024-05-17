module.exports = {
  plugins: [
    require.resolve("prettier-plugin-astro"),
    require.resolve("prettier-plugin-tailwindcss"),
  ],
  bracketSameLine: false,
  singleAttributePerLine: true,
  astroAllowShorthand: true,
  htmlWhitespaceSensitivity: "css",
  semi: false,
  printWidth: 120,
  trailingComma: "none",
  bracketSpacing: false,
  jsxSingleQuote: true,
  singleQuote: true,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
    {
      files: "*.mdx",
      options: {
        singleQuote: false,
      },
    },
  ],
};
