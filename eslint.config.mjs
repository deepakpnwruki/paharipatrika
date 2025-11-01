import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'
import globals from 'globals'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...(nextPlugin.configs['core-web-vitals']?.rules || nextPlugin.configs.recommended?.rules || {}),
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  },
  {
    files: ['next.config.js', 'postcss.config.mjs', 'scripts/**/*.mjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-control-regex': 'off'
    }
  }
]
