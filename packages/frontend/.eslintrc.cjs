module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['standard-with-typescript', 'plugin:react/recommended', 'eslint:recommended', 'plugin:react/jsx-runtime'],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['./.eslintrc.cjs', './**/*.js'],
      parserOptions: {
        sourceType: 'script',
        project: false
      }
    }
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './*/tsconfig.json']
  },
  plugins: ['react'],
  rules: {
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false,
          attributes: false
        }
      }
    ]
  }
}
