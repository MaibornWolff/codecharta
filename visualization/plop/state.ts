import { createFileAction, createInputPromt, modifyFileAction } from "./plopHelper"

const TEMPLATE_DIR = "state"
const DESTINATION_DIR = "state"

export const PLOP_STATE_VARIABLE_PROMPTS = [createInputPromt("name", "Name (e.x. foo):")]

export const PLOP_STATE_FILE_ACTIONS = [
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["service", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["service", "spec", "ts"]),
	modifyFileAction({
		path: "state/state.module.ts",
		pattern: /(\/\/ Plop: Append service name here)/gi,
		template: "$1\r\n\t.service(_.camelCase({{properCase name}}Service.name), {{properCase name}}Service)"
	}),
	modifyFileAction({
		path: "state/state.module.ts",
		pattern: /(\/\/ Plop: Append module import here)/gi,
		template: '$1\r\nimport { {{properCase name}}Service } from "./{{camelCase name}}.service"'
	})
]
