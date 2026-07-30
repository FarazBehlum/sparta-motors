import next from 'eslint-config-next'
import typescriptEslint from '@typescript-eslint/eslint-plugin'

// eslint-config-next 16 ships a native flat config, so we spread it directly.
// (Wrapping it in FlatCompat crashes eslint with a circular-structure error.)
// The default export already bundles core-web-vitals + the @typescript-eslint plugin.
const eslintConfig = [
  ...next,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    plugins: { '@typescript-eslint': typescriptEslint },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // src/migrations is written by `payload migrate:create` — generated SQL with
    // a fixed handler signature, same as payload-types.ts. Not hand-edited.
    ignores: [
      '.next/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/migrations/',
    ],
  },
]

export default eslintConfig
