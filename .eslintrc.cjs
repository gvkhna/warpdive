// eslint-disable-next-line no-undef
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
    'plugin:storybook/recommended'
  ],
  plugins: ['@typescript-eslint', 'prettier', 'no-only-tests', 'react', 'react-hooks'],
  rules: {
    'no-async-promise-executor': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    'no-console': 'warn',
    'prefer-const': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-only-tests/no-only-tests': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'error',
    'react/prop-types': 'off',
    // '@typescript-eslint/no-unused-vars': ['error', {varsIgnorePattern: '^React$'}],
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn' // Checks effect dependencies
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: ['*.js', '*.cjs'],
  overrides: [
    {
      files: ['./**/*.(js|cjs)'],
      env: {
        mocha: true
      },
      globals: {
        globalThis: false // false means read-only
      },
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['./**/*.(ts|tsx)'],
      rules: {
        'no-console': ['error', {allow: ['warn', 'error', 'info', 'debug']}]
      }
    }
  ]
}
