import { createFileAction, createInputPromt } from "./plopHelper"

const TEMPLATE_DIR = "util"
const DESTINATION_DIR = "util"

export const PLOP_UTIL_VARIABLE_PROMPTS = [createInputPromt("name", "Name:")]

export const PLOP_UTIL_FILE_ACTIONS = [
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["ts"]),
	createFileAction(TEMPLATE_DIR, DESTINATION_DIR, ["spec", "ts"])
]
