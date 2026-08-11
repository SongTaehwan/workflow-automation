/** @type {import('prettier').Config} */
export default {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: 'src/app/theme/index.css',
  tailwindFunctions: ['cn', 'cva'],
};
