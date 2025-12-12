// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import github from 'eslint-plugin-github'
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    stylistic.configs.recommended,

    globalIgnores(['dist/', 'eslint.config.mjs']),

    // Stylistic overrides
    stylistic.configs.customize({
        indent: 4,
        semi: true,
        commaDangle: 'never',
        arrowParens: true,
        blockSpacing: true,
        jsx: false,
        braceStyle: '1tbs',
        quoteProps: 'as-needed',
        quotes: 'single'
    }),

    {
        plugins: {
            '@stylistic': stylistic,
            // @ts-ignore
            'github': github
        },
        rules: {
            // ESLint rules: https://eslint.org/docs/latest/rules
            'one-var': ['error', 'never'],
            'no-console': 'error',
            'no-empty': 'error',
            'curly': ['error', 'multi-line'],
            'no-warning-comments': 'warn',

            // TSEslint rules: https://typescript-eslint.io/rules/
            '@typescript-eslint/no-inferrable-types': ['off'], // allow "trivial" types for consistency
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/prefer-for-of': 'error',

            // Stylistic rules: https://eslint.style/rules
            '@stylistic/no-multi-spaces': ['off'],
            '@stylistic/key-spacing': ['off'],

            // GitHub rules: https://github.com/github/eslint-plugin-github/tree/main?tab=readme-ov-file#rules
            'github/array-foreach': 'error'
        }
    }
);
