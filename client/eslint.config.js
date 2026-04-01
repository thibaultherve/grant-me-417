import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'public/mockServiceWorker.js'],
  },

  // Base configuration for all TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettierConfig,
    ],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      'check-file': checkFile,
      prettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // JSX Accessibility rules
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/anchor-is-valid': 'off',

      // Import rules
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Disables cross-feature imports
            {
              target: './src/features/auth',
              from: './src/features',
              except: ['./auth'],
            },
            {
              target: './src/features/employers',
              from: './src/features',
              except: ['./employers'],
            },
            {
              target: './src/features/work-entries',
              from: './src/features',
              except: ['./work-entries'],
            },
            {
              target: './src/features/visas',
              from: './src/features',
              except: ['./visas'],
            },
            {
              target: './src/features/progress',
              from: './src/features',
              except: ['./progress'],
            },
            {
              target: './src/features/hours',
              from: './src/features',
              except: ['./hours'],
            },
            {
              target: './src/features/dashboard',
              from: './src/features',
              except: ['./dashboard'],
            },
            {
              target: './src/features/directory',
              from: './src/features',
              except: ['./directory'],
            },

            // Enforce unidirectional codebase
            // src/features cannot import from src/app
            {
              target: './src/features',
              from: './src/app',
            },

            // Shared modules cannot import from features or app
            {
              target: [
                './src/components',
                './src/hooks',
                './src/lib',
                './src/types',
                './src/utils',
                './src/contexts',
              ],
              from: ['./src/features', './src/app'],
            },
          ],
        },
      ],
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // General rules
      'linebreak-style': ['error', 'unix'],

      // Prettier rules
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],

      // File naming conventions
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },

  // Folder naming convention (excluding __tests__)
  {
    files: ['src/**/!(__tests__)/*'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/*': 'KEBAB_CASE',
        },
      ],
    },
  },
);
