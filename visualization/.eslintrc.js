module.exports = {
    env: {
        "browser": true,
        "es6": true,
        "node": true,
        "jest": true
    },
    globals: {
        page: true,
        browser: true,
        context: true,
        jestPuppeteer: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:unicorn/recommended",
        "prettier",
        "prettier/@typescript-eslint",
        "prettier/unicorn",
    ], // prettier must be last in array to override other configs
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    plugins: [
        "@typescript-eslint",
        "unicorn"
    ],
    rules: {
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": ["variable", "function"],
                "format": ["camelCase", "UPPER_CASE", "PascalCase"],
                "leadingUnderscore": "allow"
            }
        ],
        "@typescript-eslint/no-empty-function": ["error",  {allow: ["arrowFunctions"] }],
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-unused-vars": ["error"],
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/promise-function-async": "error",

        "no-console": ["error", {allow: ["warn", "error"]}],
        "no-duplicate-imports": "error",
        "no-else-return": ["error", { allowElseIf: false }],
        "no-implicit-coercion": "error",
        "no-lonely-if": ["error"],
        "no-path-concat": "error",
        "no-return-await": "error",
        "object-shorthand": ["error", "always"],
        "prefer-destructuring": ["error", {
            "AssignmentExpression": {
              "array": false,
              "object": true
            }
        }],
        "prefer-regex-literals": "error",
        "prefer-template": "error",
        eqeqeq: ["error", "smart"],

        "unicorn/prevent-abbreviations": ["error", { checkFilenames: false, whitelist: { len: true } }],

        // Do not apply inappropriate rules below
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/filename-case": "off",
        "unicorn/no-null": "off",
        "unicorn/no-object-as-default-parameter": "off",
        "unicorn/no-reduce": "off",
        "unicorn/prefer-query-selector": "off",
        "unicorn/prefer-node-append": "off",
    }
}
