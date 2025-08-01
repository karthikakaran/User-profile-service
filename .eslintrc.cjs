module.exports = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  env: {
    browser: true,
    node: true,
    es2022: true,
  },

  extends: ['eslint:recommended', 'plugin:prettier/recommended'],

  plugins: ['prettier'],

  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },

  ignorePatterns: ['node_modules/'],
};
