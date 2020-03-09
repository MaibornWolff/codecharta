module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": ["prettier"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "prettier",
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/class-name-casing": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                "accessibility": "explicit",
                "overrides": {
                    "constructors": "no-public"
                }
            }
        ],
        "@typescript-eslint/triple-slash-reference": "error",
        "curly": "error",
        "new-parens": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": [
            "warn",
            {
                "allow": [
                    "warn",
                    "dir",
                    "timeLog",
                    "assert",
                    "clear",
                    "count",
                    "countReset",
                    "group",
                    "groupEnd",
                    "table",
                    "dirxml",
                    "error",
                    "groupCollapsed",
                    "Console",
                    "profile",
                    "profileEnd",
                    "timeStamp",
                    "context"
                ]
            }
        ],
        "no-empty": "error",
        "no-eval": "error",
        "no-var": "error",
        "prettier/prettier": "warn"
    }
};
