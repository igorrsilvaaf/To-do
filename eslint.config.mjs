import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      // Adicione ou ajuste as regras personalizadas aqui
    },
  },
  pluginJs.configs.recommended,
];