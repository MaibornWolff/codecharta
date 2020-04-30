import { createFileAction, createInputPromt, modifyFileAction } from "./plopHelper"

const TEMPLATE_DIR: string = "reduxSubreducer"
const DESTINATION_DIR: string = "codeCharta/state/store/{{camelCase name}}"

export const PLOP_REDUX_SUBREDUCER_VARIABLE_PROMPTS = [createInputPromt("name", "Name (e.x. dynamicSettings):")]

export const PLOP_REDUX_SUBREDUCER_FILE_ACTIONS = [
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["actions", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["reducer", "spec", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["reducer", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["splitter", "ts"]),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.reducer.ts",
		pattern: /(\/\/ Plop: Import sub-reducer here)/gi,
		template: '$1\r\nimport {{camelCase name}} from "./{{camelCase name}}/{{camelCase name}}.reducer"'
	}),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.reducer.ts",
		pattern: /(\/\/ Plop: Append sub-reducer here)/gi,
		template: "$1\r\n\t{{camelCase name}},"
	}),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.actions.ts",
		pattern: /(\/\/ Plop: Import sub-reducer here)/gi,
		template: '$1\r\nimport { default{{properCase name}} } from "./{{camelCase name}}/{{camelCase name}}.actions"'
	}),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.actions.ts",
		pattern: /(\/\/ Plop: Append sub-reducer here)/gi,
		template: "$1\r\n\t{{camelCase name}}: default{{properCase name}},"
	}),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.splitter.ts",
		pattern: /(\/\/ Plop: Import sub-reducer action here)/gi,
		template: '$1\r\nimport { {{properCase name}}Actions } from "./{{camelCase name}}/{{camelCase name}}.actions"'
	}),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.splitter.ts",
		pattern: /(\/\/ Plop: Import sub-reducer splitter here)/gi,
		template: '$1\r\nimport { split{{properCase name}}Actions } from "./{{camelCase name}}/{{camelCase name}}.splitter"'
	}),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.splitter.ts",
		pattern: /(\/\/ Plop: Propagate sub-reducer here)/gi,
		template:
			"$1\r\n\tif (_.values({{properCase name}}Actions).includes(action.type)) {\n\t\treturn split{{properCase name}}Actions(action.payload)\n\t}\n"
	}),
	modifyFileAction({
		filePath: "app/codeCharta/state/store/state.splitter.ts",
		pattern: /(\/\/ Plop: Split into sub-reducer here)/gi,
		template:
			"$1\r\n\t\tif (action.payload.{{camelCase name}} !== undefined) {\n\t\t\tactions = actions.concat(...split{{properCase name}}Actions(action.payload.{{camelCase name}}))\n\t\t}\n"
	})
]
