// eslint-disable-next-line no-console
console.log(`project info - postcss.config.cjs was run - dirname: ${__dirname} - cwd: ${process.cwd()}`)

module.exports = {
  plugins: [require('tailwindcss'), require('autoprefixer'), require('cssnano')]
}
