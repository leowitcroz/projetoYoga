import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/android/**',
      '**/ios/**',
      'apps/api/src/generated/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['apps/app/**', 'apps/admin/**'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['apps/api/**', 'packages/**', '**/*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    // Os componentes do Ionic são web components e usam o atributo nativo `slot`.
    files: ['apps/app/**/*.vue'],
    rules: { 'vue/no-deprecated-slot-attribute': 'off' },
  },
  prettier,
);
