import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-plugin-prettier/recommended';
import * as unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';
import 'eslint-plugin-only-warn';

export default [
  {
    ignores: ['dist/', 'coverage/', 'eslint.tsconfig.mjs'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        warnOnUnsupportedTypeScriptVersion: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],
  prettier,
  {
    rules: {
      'unicorn/prevent-abbreviations': [
        'warn',
        {
          replacements: {
            args: false,
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
];
