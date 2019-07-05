const promptDirectory = require("inquirer-directory")
const promptFile = require("inquirer-file")

const appBase = "app"

module.exports = function(plop) {
	plop.setPrompt("directory", promptDirectory)
	plop.setPrompt("file", promptFile)

	plop.setGenerator("state service", {
		description: "an empty service with corresponding test file",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Name (e.x. foo):"
			}
		],
		actions: [
			buildAddAction(["{{camelCase name}}", "service", "ts"], "codeCharta/state"),
			buildAddAction(["{{camelCase name}}", "service", "spec", "ts"], "codeCharta/state"),
			{
				type: "modify",
				path: "app/codeCharta/state/state.module.ts",
				pattern: /(\/\/ Plop: Append service name here)/gi,
				template: "$1\r\n\t.service(_.camelCase({{properCase name}}Service.name), {{properCase name}}Service)"
			},
			{
				type: "modify",
				path: "app/codeCharta/state/state.module.ts",
				pattern: /(\/\/ Plop: Append module import here)/gi,
				template: '$1\r\nimport { {{properCase name}}Service } from "./{{camelCase name}}.service"'
			}
		]
	})

	plop.setGenerator("ui module", {
		description: "an ui module with an empty component, all necessary files and tests",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Name:"
			}
		],
		actions: [
			buildAddAction(["{{camelCase name}}", "component", "ts"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction(["{{camelCase name}}", "module", "ts"], "codeCharta/ui/{{camelCase name}}", "ui"),
			buildAddAction(["{{camelCase name}}", "component", "html"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction(["{{camelCase name}}", "component", "scss"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction(["{{camelCase name}}", "e2e", "ts"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction(["{{camelCase name}}", "po", "ts"], "codeCharta/ui/{{camelCase name}}"),
			buildAddAction(["{{camelCase name}}", "component", "spec", "ts"], "codeCharta/ui/{{camelCase name}}"),
			{
				type: "modify",
				path: "app/codeCharta/ui/ui.ts",
				pattern: /(\/\/ Plop: Append component name here)/gi,
				template: '$1\r\n\t\t"app.codeCharta.ui.{{camelCase name}}",'
			},
			{
				type: "modify",
				path: "app/codeCharta/ui/ui.ts",
				pattern: /(\/\/ Plop: Append module import here)/gi,
				template: '$1\r\nimport "./{{camelCase name}}/{{camelCase name}}.module";'
			}
		]
	})

	plop.setGenerator("util static class", {
		description: "an empty static class with corresponding test file",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Name:"
			}
		],
		actions: [
			buildAddAction(["{{camelCase name}}", "ts"], "codeCharta/util", "util"),
			buildAddAction(["{{camelCase name}}", "spec", "ts"], "codeCharta/util", "util")
		]
	})
}

function buildAddAction(suffixTokens = ["{{camelCase name}}", "ts"], dir = "{{directory}}", templatePrefix = null) {
	let templateNameSuffixTokens = suffixTokens
	if (templatePrefix) {
		templateNameSuffixTokens = templateNameSuffixTokens.slice(1)
		templateNameSuffixTokens = ["", templatePrefix].concat(templateNameSuffixTokens)
	}
	return {
		type: "add",
		path: appBase + "/" + dir + "/" + suffixTokens.join("."),
		templateFile: "plop-templates/" + templateNameSuffixTokens.slice(1).join(".") + ".hbs"
	}
}
