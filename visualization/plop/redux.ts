import { createFileAction, createInputPromt, modifyFileAction } from "./plopHelper"

const TEMPLATE_DIR: string = "redux"
const DESTINATION_DIR: string = "state/store/{{camelCase subreducer}}/{{camelCase name}}"

export const PLOP_REDUX_VARIABLE_PROMPTS = [
	createInputPromt("name", "Property Name (e.x. areaMetric):"),
	createInputPromt("type", "Type (e.x. string, boolean, Edge[]):"),
	createInputPromt("default", "Default Value (e.x. null, true, 1234 or MY_STRING):"),
	createInputPromt("randomvalue", "Another possible Value, we use in tests (e.x. false, 5678 or ANOTHER_STRING):"),
	createInputPromt("subreducer", "Sub Reducer MUST EXIST BEFORE USING (e.x. fileSettings):")
]

export const PLOP_REDUX_FILE_ACTIONS = [
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["actions", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["reducer", "spec", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["reducer", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["service", "spec", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["service", "ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["splitter", "ts"]),
	modifyFileAction({
		path: "state/state.module.ts",
		pattern: /(\/\/ Plop: Append service name here)/gi,
		template: "$1\r\n\t.service(_.camelCase({{properCase name}}Service.name), {{properCase name}}Service)"
	}),
	modifyFileAction({
		path: "state/state.module.ts",
		pattern: /(\/\/ Plop: Append module import here)/gi,
		template:
			'$1\r\nimport { {{properCase name}}Service } from "./store/{{camelCase subreducer}}/{{camelCase name}}/{{camelCase name}}.service"'
	}),
	modifyFileAction({
		path: "state/injector.service.ts",
		pattern: /(\/\/ Plop: Append service import here)/gi,
		template:
			'$1\r\nimport { {{properCase name}}Service } from "./store/{{camelCase subreducer}}/{{camelCase name}}/{{camelCase name}}.service"'
	}),
	modifyFileAction({
		path: "state/injector.service.ts",
		pattern: /(\/\/ Plop: Append service injection here)/gi,
		template: "$1\r\n\t\tprivate {{camelCase name}}Service: {{properCase name}}Service,"
	}),
	modifyFileAction({
		path: "state/store/{{camelCase subreducer}}/{{camelCase subreducer}}.reducer.ts",
		pattern: /(\/\/ Plop: Append reducer import here)/gi,
		template: '$1\r\nimport { {{camelCase name}} } from "./{{camelCase name}}/{{camelCase name}}.reducer"'
	}),
	modifyFileAction({
		path: "state/store/{{camelCase subreducer}}/{{camelCase subreducer}}.reducer.ts",
		pattern: /(\/\/ Plop: Append sub-reducer here)/gi,
		template: "$1\r\n{{camelCase name}},"
	}),
	modifyFileAction({
		path: "state/store/{{camelCase subreducer}}/{{camelCase subreducer}}.splitter.ts",
		pattern: /(\/\/ Plop: Append action splitter import here)/gi,
		template:
			'$1\r\nimport { split{{properCase name}}Action } from "./{{camelCase name}}/{{camelCase name}}.splitter"'
	}),
	modifyFileAction({
		path: "state/store/{{camelCase subreducer}}/{{camelCase subreducer}}.splitter.ts",
		pattern: /(\/\/ Plop: Append action split here)/gi,
		template:
			"$1\r\n\tif (payload.{{camelCase name}} !== undefined) {\n\t\tactions.push(split{{properCase name}}Action(payload.{{camelCase name}}))\n\t}\n"
	}),
	modifyFileAction({
		path: "state/store/{{camelCase subreducer}}/{{camelCase subreducer}}.reducer.ts",
		pattern: /(\/\/ Plop: Append action forwarding here)/gi,
		template:
			"$1\r\n\t\t{{camelCase name}}: {{camelCase name}}(state.{{camelCase name}}, {{camelCase name}}Action),"
	}),
	modifyFileAction({
		path: "state/store/{{camelCase subreducer}}/{{camelCase subreducer}}.actions.ts",
		pattern: /(\/\/ Plop: Append default property here)/gi,
		template: "$1\r\n\t{{camelCase name}}: default{{properCase name}},"
	}),
	modifyFileAction({
		path: "state/store/{{camelCase subreducer}}/{{camelCase subreducer}}.actions.ts",
		pattern: /(\/\/ Plop: Append default property import here)/gi,
		template: `$1\r\nimport { default{{properCase name}} } from "./{{camelCase name}}/{{camelCase name}}.actions"`
	})
]
