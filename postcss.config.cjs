const url = require('postcss-url')
const path = require('path')

// eslint-disable-next-line no-console
console.log(`project info - postcss.config.cjs was run - dirname: ${__dirname} - cwd: ${process.cwd()}`)

module.exports = {
  plugins: [
    // require('postcss-obfuscator')({
    //   /* options */
    //   srcPath: 'src', // Source of your files.
    //   desPath: 'dist', // Destination for obfuscated html/js/.. files.
    //   extensions: ['.astro'],
    //   // cssExcludes: ['css/input.css'], // Files and paths to exclude from css obfuscation.
    //   formatJson: true // Format obfuscation data JSON file.
    // }),
    require('postcss-font-base64'),
    url({
      // filter: '*.woff2',
      basePath: [path.resolve(process.cwd(), 'src/images'), path.resolve(process.cwd(), 'src/images/icons')],
      url: 'inline', // enable inline assets using base64 encoding
      // maxSize: 10, // maximum file size to inline (in kilobytes)
      fallback: 'copy' // fallback method to use if max size is exceeded
    }),
    require('tailwindcss'),
    require('autoprefixer')
    // require('cssnano'),
  ]
}
