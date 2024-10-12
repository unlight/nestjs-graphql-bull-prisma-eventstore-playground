import 'eslint-plugin-only-warn';

import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-plugin-prettier/recommended';
import * as unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  {
    ignores: ['dist/', 'coverage/', 'eslint.tsconfig.mjs', 'webpack.config.*'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: ['./tsconfig.json'],
        warnOnUnsupportedTypeScriptVersion: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // sonarjs.configs.recommended,

  prettier,
  {
    ...unicorn.configs['flat/recommended'],
    rules: {
      'unicorn/prevent-abbreviations': [
        'warn',
        {
          replacements: {
            args: false,
            e: false,
          },
        },
      ],
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-objects': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/only-throw-error': 0, // https://github.com/ehmicky/modern-errors/issues/31
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      'no-throw-literal': 0,
      'consistent-return': 0,
      'max-lines': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/camelcase': 0,
      'import/max-dependencies': 0,
    },
  },
];
