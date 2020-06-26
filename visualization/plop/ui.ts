import { createFileAction, createInputPromt, modifyFileAction } from "./plopHelper"

const TEMPLATE_DIR: string = "ui"
const DESTINATION_DIR: string = "ui/{{camelCase name}}"

export const PLOP_UI_VARIABLE_PROMPTS = [createInputPromt("name", "Name:")]

export const PLOP_UI_FILE_ACTIONS = [
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["component", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["module", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["component", "html"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["component", "scss"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["e2e", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["po", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["component", "spec", "ts"]),
	modifyFileAction({
		path: "ui/ui.ts",
		pattern: /(\/\/ Plop: Append component name here)/gi,
		template: '$1\r\n\t\t"app.codeCharta.ui.{{camelCase name}}",'
	}),
	modifyFileAction({
		path: "ui/ui.ts",
		pattern: /(\/\/ Plop: Append module import here)/gi,
		template: '$1\r\nimport "./{{camelCase name}}/{{camelCase name}}.module";'
	})
]
