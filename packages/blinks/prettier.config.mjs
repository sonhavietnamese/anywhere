/** @type {import("prettier").Config} */
const config = {
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
  trailingComma: 'all',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  tailwindFunctions: ['clsx', 'cn'],
};

export default config;
