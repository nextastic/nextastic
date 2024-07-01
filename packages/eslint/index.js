// index.js
export default [
  {
    extends: ['next/core-web-vitals', 'plugin:jest/recommended'],
    plugins: ['@typescript-eslint/eslint-plugin', 'jest'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'jest/no-try-expect': 'off',
      'jest/no-test-callback': 'off',
      'jest/no-conditional-expect': 'off',
    },
  },
]
