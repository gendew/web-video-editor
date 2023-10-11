module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['mobx', 'react-hooks'],
  extends: 'plugin:mobx/recommended',
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off'
  }
}
