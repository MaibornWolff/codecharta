import { NodePlopAPI } from "plop"
import { PLOP_STATE_FILE_ACTIONS, PLOP_STATE_VARIABLE_PROMPTS } from "./plop/state"
import { PLOP_UI_FILE_ACTIONS, PLOP_UI_VARIABLE_PROMPTS } from "./plop/ui"
import { PLOP_UTIL_FILE_ACTIONS, PLOP_UTIL_VARIABLE_PROMPTS } from "./plop/util"
import { PLOP_REDUX_FILE_ACTIONS, PLOP_REDUX_VARIABLE_PROMPTS } from "./plop/redux"
import { PLOP_REDUX_SUBREDUCER_FILE_ACTIONS, PLOP_REDUX_SUBREDUCER_VARIABLE_PROMPTS } from "./plop/reduxSubreducer"

export default function (plop: NodePlopAPI) {
	plop.setGenerator("state service", {
		description: "an empty service with corresponding test file",
		prompts: PLOP_STATE_VARIABLE_PROMPTS,
		actions: PLOP_STATE_FILE_ACTIONS
	})

	plop.setGenerator("ui module", {
		description: "an ui module with an empty component, all necessary files and tests",
		prompts: PLOP_UI_VARIABLE_PROMPTS,
		actions: PLOP_UI_FILE_ACTIONS
	})

	plop.setGenerator("util static class", {
		description: "an empty static class with corresponding test file",
		prompts: PLOP_UTIL_VARIABLE_PROMPTS,
		actions: PLOP_UTIL_FILE_ACTIONS
	})

	plop.setGenerator("redux property", {
		description: "a store property including actions, reducer, service and test files",
		prompts: PLOP_REDUX_VARIABLE_PROMPTS,
		actions: PLOP_REDUX_FILE_ACTIONS
	})

	plop.setGenerator("redux subreducer", {
		description: "creates a subreducer like dynamicSettings",
		prompts: PLOP_REDUX_SUBREDUCER_VARIABLE_PROMPTS,
		actions: PLOP_REDUX_SUBREDUCER_FILE_ACTIONS
	})
}
