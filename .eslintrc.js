module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    // 'no-unused-vars': 'warn',
    'vue/no-unused-vars': 'off'
  },

  'extends': [
    'plugin:vue/essential'
  ]
}
