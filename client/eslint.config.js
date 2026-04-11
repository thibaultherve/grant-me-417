import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import projectStructure from 'eslint-plugin-project-structure';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
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
      reactYouMightNotNeedAnEffect.configs.recommended,
    ],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      'check-file': checkFile,
      prettier,
      boundaries,
      'project-structure': projectStructure.projectStructurePlugin,
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
      // eslint-plugin-boundaries: declare the architectural elements.
      // Order matters — more specific patterns must come before broader ones.
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'src/app/**/*',
          mode: 'full',
        },
        {
          type: 'feature',
          pattern: 'src/features/*/**/*',
          mode: 'full',
          capture: ['feature'],
        },
        {
          type: 'shared',
          pattern:
            'src/{components,hooks,lib,types,utils,contexts,config,assets}/**/*',
          mode: 'full',
        },
      ],
      'boundaries/ignore': [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
      ],
      'boundaries/include': ['src/**/*'],
    },
    rules: {
      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      // R9 — Context.Provider value must have stable identity
      'react/jsx-no-constructed-context-values': 'error',

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // JSX Accessibility rules
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/anchor-is-valid': 'off',

      // -----------------------------------------------------------------
      // Architecture — eslint-plugin-boundaries v6 (boundaries/dependencies)
      // app     → app | feature | shared
      // feature → same feature only (templated) | shared
      // shared  → shared only
      // -----------------------------------------------------------------
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: { to: { type: ['app', 'feature', 'shared'] } },
            },
            {
              from: { type: 'feature' },
              allow: {
                to: {
                  type: 'feature',
                  captured: { feature: '{{from.captured.feature}}' },
                },
              },
            },
            {
              from: { type: 'feature' },
              allow: { to: { type: 'shared' } },
            },
            {
              from: { type: 'shared' },
              allow: { to: { type: 'shared' } },
            },
          ],
        },
      ],
      'boundaries/no-unknown': 'error',
      'boundaries/no-unknown-files': 'off',

      // -----------------------------------------------------------------
      // Effect antipatterns — eslint-plugin-react-you-might-not-need-an-effect
      // configs.recommended already registers the rule set via `extends`.
      // We promote a couple to `error` explicitly.
      // -----------------------------------------------------------------
      'react-you-might-not-need-an-effect/no-derived-state': 'error',
      'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change':
        'error',
      'react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change':
        'error',
      'react-you-might-not-need-an-effect/no-pass-live-state-to-parent':
        'error',
      'react-you-might-not-need-an-effect/no-pass-data-to-parent': 'warn',
      'react-you-might-not-need-an-effect/no-empty-effect': 'error',
      'react-you-might-not-need-an-effect/no-chain-state-updates': 'warn',
      'react-you-might-not-need-an-effect/no-initialize-state': 'warn',
      'react-you-might-not-need-an-effect/no-event-handler': 'warn',

      // Import rules (kept from previous config, minus no-restricted-paths)
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

      // R8 — component files over 300 lines are too large (warn, not break)
      'max-lines': [
        'warn',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],

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

  // R7 — custom hook files are capped lower than components
  {
    files: ['**/hooks/use-*.{ts,tsx}', '**/use-*-state.ts', '**/use-*-actions.ts'],
    rules: {
      'max-lines': [
        'warn',
        { max: 250, skipBlankLines: true, skipComments: true },
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

  // -----------------------------------------------------------------
  // eslint-plugin-project-structure — independent-modules
  // Uses {family} template: "the common path between import and current file"
  // For a file in src/features/X/**, {family} resolves to src/features/X,
  // giving us automatic same-feature isolation.
  // -----------------------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'project-structure': projectStructure.projectStructurePlugin,
    },
    rules: {
      'project-structure/independent-modules': [
        'error',
        {
          pathAliases: {
            baseUrl: '.',
            paths: {
              '@/*': ['./src/*'],
            },
          },
          // In a pnpm monorepo, the plugin auto-detects projectRoot as the
          // folder ABOVE node_modules — i.e. the monorepo root, not client/.
          // packageRoot is resolved relative to that, so './client' pins it
          // to client/node_modules where the actual deps live.
          packageRoot: './client',
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
          modules: [
            // NOTE: Feature-module isolation is enforced by
            // boundaries/dependencies with captured element types — it handles
            // cross-feature imports and same-feature allowance via
            // `{{from.captured.feature}}`. We don't duplicate that here
            // because independent-modules' {family_N} template compares raw
            // import strings and trips on alias imports like
            // `@/features/<same>/...` even though they're legitimate.
            {
              name: 'Shared module',
              pattern: [
                '**/src/components/**',
                '**/src/hooks/**',
                '**/src/lib/**',
                '**/src/types/**',
                '**/src/utils/**',
                '**/src/contexts/**',
                '**/src/config/**',
              ],
              allowExternalImports: true,
              allowImportsFrom: [
                // Same-boundary relative imports (siblings / sub-folders).
                // The `pattern` above already gates this file into the shared
                // zone, so a relative import can't escape the boundary.
                './**',
                '../**',
                'src/components/**',
                'src/hooks/**',
                'src/lib/**',
                'src/types/**',
                'src/utils/**',
                'src/contexts/**',
                'src/config/**',
                'src/assets/**',
                '@/components/**',
                '@/hooks/**',
                '@/lib/**',
                '@/types/**',
                '@/utils/**',
                '@/contexts/**',
                '@/config/**',
                '@/assets/**',
                'src/*.{ts,tsx,css}',
                '@/*.{ts,tsx,css}',
              ],
              errorMessage:
                'Shared modules must not import from features/ or app/. If this file looks like domain code (auth, user, billing, …), move it to features/<domain>/.',
            },
            {
              name: 'App module',
              pattern: '**/src/app/**',
              allowExternalImports: true,
              allowImportsFrom: [
                './**',
                '../**',
                '{family}/**',
                '@/app/**',
                'src/features/**',
                '@/features/**',
                'src/components/**',
                'src/hooks/**',
                'src/lib/**',
                'src/types/**',
                'src/utils/**',
                'src/contexts/**',
                'src/config/**',
                'src/assets/**',
                '@/components/**',
                '@/hooks/**',
                '@/lib/**',
                '@/types/**',
                '@/utils/**',
                '@/contexts/**',
                '@/config/**',
                '@/assets/**',
                'src/*.{ts,tsx,css}',
                '@/*.{ts,tsx,css}',
              ],
            },
          ],
        },
      ],
    },
  },
);
