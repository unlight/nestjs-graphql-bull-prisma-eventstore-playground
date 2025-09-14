import 'eslint-plugin-only-warn';

import pluginJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import depend from 'eslint-plugin-depend';
import importx from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  unicorn.configs.recommended,
  sonarjs.configs.recommended,
  prettier,
  {
    ignores: ['dist/', 'coverage/'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
      sourceType: 'module',
    },
  },
  {
    extends: [importx.flatConfigs.recommended, importx.flatConfigs.typescript],
    rules: {
      'import-x/order': [
        'warn',
        {
          alphabetize: {
            caseInsensitive: false,
            order: 'asc',
            orderImportKind: 'asc',
          },
          groups: [
            'builtin', // Node.js built-in modules (e.g., `fs`)
            'external', // Packages from `node_modules`
            'internal', // Absolute imports (via path aliases)
            ['parent', 'sibling', 'index'], // Relative imports
            'object', // Type imports (if using TypeScript)
            'type', // Side-effect imports
          ],
          'newlines-between': 'always', // Add newlines between groups
          pathGroups: [
            {
              // The predefined group this PathGroup is defined in relation to
              group: 'external',
              // Minimatch pattern used to match against specifiers
              pattern: '@/**',
              // How matching imports will be positioned relative to "group"
              position: 'after',
            },
          ],
        },
      ],
    },
  },
  {
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
          order: 'asc',
          type: 'natural',
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
    extends: [tseslint.configs.disableTypeChecked],
    files: ['*.config.*', '.remarkrc.cjs', 'stryker.conf.mjs'],
    rules: {
      'import-x/no-named-as-default-member': 0,
    },
  },
  {
    extends: ['depend/flat/recommended'],
    plugins: { depend },
    rules: {
      'depend/ban-dependencies': [1, { allowed: ['lodash'] }],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/camelcase': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      'consistent-return': 0,
      'import-x/max-dependencies': 0,
      'max-lines': 0,
      'no-throw-literal': 0,
    },
  },
);
