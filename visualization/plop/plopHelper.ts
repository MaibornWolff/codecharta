const APP_BASE: string = "app/"
const TEMPLATE_DIRECTORY: string = "plop/templates/"
const FILE_NAME_SEPARATOR = "."
const PATH_SEPARATOR = "/"
const NAME = "{{camelCase name}}"
const PLOP_TEMPLATE_EXTENSION = FILE_NAME_SEPARATOR + "hbs"

interface FileModification {
	filePath: string
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
		filePath: modification.filePath,
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
