module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true
	},
	globals: {
		page: true,
		browser: true,
		context: true,
		jestPuppeteer: true
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:unicorn/recommended",
		"prettier"
	], // prettier must be last in array to override other configs
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		sourceType: "module"
	},
	plugins: ["@typescript-eslint", "unicorn", "unused-imports"],
	rules: {
		"@typescript-eslint/naming-convention": [
			"error",
			{
				selector: ["variable", "function"],
				format: ["camelCase", "UPPER_CASE", "PascalCase"],
				leadingUnderscore: "allow"
			}
		],
		"@typescript-eslint/no-empty-function": ["error", { allow: ["arrowFunctions"] }],
		"@typescript-eslint/no-unnecessary-type-arguments": "error",
		"@typescript-eslint/no-unused-expressions": "error",
		"@typescript-eslint/no-unused-vars": ["error"],
		"@typescript-eslint/prefer-optional-chain": "error",
		"@typescript-eslint/prefer-string-starts-ends-with": "error",
		"@typescript-eslint/promise-function-async": "error",
		"@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "no-public" }],
		curly: ["error", "all"],
		eqeqeq: ["error", "smart"],
		"no-console": ["error", { allow: ["warn", "error"] }],
		"no-duplicate-imports": "error",
		"no-else-return": ["error", { allowElseIf: false }],
		"no-implicit-coercion": "error",
		"no-lonely-if": ["error"],
		"no-path-concat": "error",
		"no-return-await": "error",
		"object-shorthand": ["error", "always"],
		"prefer-destructuring": [
			"error",
			{
				AssignmentExpression: {
					array: false,
					object: false
				}
			}
		],
		"prefer-regex-literals": "error",
		"prefer-template": "error",

		"unicorn/prevent-abbreviations": ["error", { checkFilenames: false }],
		"unicorn/switch-case-braces": ["error", "avoid"],
		"no-unused-vars": "off",
		"unused-imports/no-unused-imports": "error",
		"unused-imports/no-unused-vars": [
			"warn",
			{
				vars: "all",
				varsIgnorePattern: "^_",
				args: "after-used",
				argsIgnorePattern: "^_"
			}
		],

		// Do not apply inappropriate rules below
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-use-before-define": "off",
		"unicorn/consistent-function-scoping": "off",
		"unicorn/filename-case": "off",
		"unicorn/no-null": "off",
		"unicorn/no-object-as-default-parameter": "off",
		"unicorn/no-array-reduce": "off",
		"unicorn/prefer-add-event-listener": "off",
		"unicorn/prefer-blob-reading-methods": "off", // issue#3331
		"unicorn/prefer-dom-node-append": "off",
		"unicorn/prefer-event-target": "off", // depends on issue https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1853
		"unicorn/prefer-module": "off",
		"unicorn/prefer-node-protocol": "off",
		"unicorn/prefer-query-selector": "off",
		"unicorn/no-useless-undefined": "off",
		"unicorn/no-negated-condition": "off"
	}
}
