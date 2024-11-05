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
      ecmaVersion: 12,          // Define a versão do ECMAScript (ECMAScript 12 - ES2021)
      sourceType: 'module',      // Define o tipo de módulo
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    env: {
      browser: true,
      node: true,
      jest: true,
      es6: true,
      commonjs: true,
    },
    rules: {
      // Adicione ou ajuste as regras personalizadas aqui
    },
  },
  pluginJs.configs.recommended,
];