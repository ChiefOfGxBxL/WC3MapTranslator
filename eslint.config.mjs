// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    // stylistic.configs.recommended,

    globalIgnores(['dist/']),

    // https://eslint.org/docs/latest/rules
    {
        rules: {

        }
    },

    // https://eslint.style/rules
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
    })
);
