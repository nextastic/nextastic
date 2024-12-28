module.exports = {
  extends: ['plugin:jest/recommended'],
  plugins: ['@typescript-eslint/eslint-plugin', 'jest'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
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
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
}
