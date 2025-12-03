// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
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
            '@stylistic': stylistic
        },
        rules: {
            // ESLint rules: https://eslint.org/docs/latest/rules
            'one-var': ['error', 'never'],
            'no-console': 'error',
            'no-empty': 'error',
            'curly': ['error', 'multi-line'],

            // TSEslint rules: https://typescript-eslint.io/rules/
            '@typescript-eslint/no-inferrable-types': ['off'], // allow "trivial" types for consistency
            '@typescript-eslint/no-require-imports': 'error',

            // Stylistic rules: https://eslint.style/rules
            '@stylistic/no-multi-spaces': ['off'],
            '@stylistic/key-spacing': ['off']
        }
    }
);
