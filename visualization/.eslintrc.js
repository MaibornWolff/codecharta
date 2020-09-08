module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "jest": true
    },
    "globals": {
        page: true,
        browser: true,
        context: true,
        jestPuppeteer: true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint",
    ], // prettier must be last in array to override other configs
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "no-console": ["error", {allow: ["warn", "error"]}],
        "@typescript-eslint/no-empty-function": ["error", {allow: ["arrowFunctions"]}],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": ["variable", "function"],
                "format": ["camelCase", "UPPER_CASE"],
                "leadingUnderscore": "allow"
            }
        ],
        "@typescript-eslint/no-unused-vars": ["error"],
        "object-shorthand": ["error", "always"],

        // Do not apply inappropriate rules below
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/ban-ts-comment": "off",

        // TODO fix and remove rules below
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/consistent-type-assertions": "off",
    }
}
