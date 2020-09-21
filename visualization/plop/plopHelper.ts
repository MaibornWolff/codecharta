const OUTSIDE_DIST = "../../"
const APP_BASE = OUTSIDE_DIST + "app/codeCharta/"
const TEMPLATE_DIRECTORY = OUTSIDE_DIST + "plop/templates/"
const FILE_NAME_SEPARATOR = "."
const PATH_SEPARATOR = "/"
const NAME = "{{camelCase name}}"
const PLOP_TEMPLATE_EXTENSION = FILE_NAME_SEPARATOR + "hbs"

interface FileModification {
	path: string
	pattern: RegExp
	template: string
}
export function createFileAction(sourceDirectory: string, destinationDirectory: string, suffixTokens: string[]) {
	return {
		type: "add",
		path: APP_BASE + destinationDirectory + PATH_SEPARATOR + [NAME, ...suffixTokens].join(FILE_NAME_SEPARATOR),
		templateFile: TEMPLATE_DIRECTORY + sourceDirectory + PATH_SEPARATOR + suffixTokens.join(".") + PLOP_TEMPLATE_EXTENSION
	}
}

export function modifyFileAction(modification: FileModification) {
	return {
		type: "modify",
		path: APP_BASE + modification.path,
		pattern: modification.pattern,
		template: modification.template
	}
}

export function createInputPromt(name: string, message: string) {
	return {
		type: "input",
		name: name,
		message: message
	}
}
