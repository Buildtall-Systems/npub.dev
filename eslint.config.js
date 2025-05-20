import eslintPluginSvelte from 'eslint-plugin-svelte';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Global ignores
  {
    ignores: [
      '.DS_Store',
      'node_modules/',
      'build/',
      '.svelte-kit/',
      'dist/',
      'package/',
      '.env',
      '.env.*',
      '!.env.example',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
    ]
  },
  // Base configuration for all files
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  // JavaScript/TypeScript files
  {
    files: ['**/*.js', '**/*.ts', '**/*.svelte'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        extraFileExtensions: ['.svelte']
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs['eslint-recommended'].rules,
      ...typescriptPlugin.configs['recommended'].rules,
      // Add any project-specific JS/TS rules here
    },
  },
  // Svelte files
  {
    files: ['**/*.svelte'],
    plugins: {
      svelte: eslintPluginSvelte,
    },
    processor: eslintPluginSvelte.processors.svelte,
    rules: {
      ...eslintPluginSvelte.configs.base.rules,
      ...eslintPluginSvelte.configs.recommended.rules,
      // Add any project-specific Svelte rules here
    },
    languageOptions: {
      // Ensure Svelte's script tags are parsed as TS
      parserOptions: {
        parser: typescriptParser,
      }
    }
  },
  // Prettier compatibility
  // This should be the last configuration in the array
  prettierConfig,
];
