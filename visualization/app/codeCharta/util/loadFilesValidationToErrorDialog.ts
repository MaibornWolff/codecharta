import { CCFileValidationResult } from "./fileValidator"

export function loadFilesValidationToErrorDialog(fileValidationResults: CCFileValidationResult[]) {
	const htmlMessages = [...buildErrorMessages(fileValidationResults), ...buildWarningsMessages(fileValidationResults)]
	return {
		title: "Something is wrong with the uploaded file(s)",
		message: htmlMessages.join("")
	}
}

export function buildErrorMessages(fileValidationResults: CCFileValidationResult[]) {
	const filesWithErrors = fileValidationResults.filter(validationResult => validationResult.errors.length > 0)
	return filesWithErrors.length > 0
		? ["<h2>Errors</h2>", ...filesWithErrors.map(fileWithErrors => buildFileErrorMessage(fileWithErrors))]
		: []
}

export function buildWarningsMessages(fileValidationResults: CCFileValidationResult[]) {
	const filesWithWarnings = fileValidationResults.filter(validationResult => validationResult.warnings.length > 0)
	return filesWithWarnings.length > 0
		? ["<h2>Warnings</h2>", ...filesWithWarnings.map(fileWithWarnings => buildFileWarningMessage(fileWithWarnings))]
		: []
}

function buildFileErrorMessage(fileValidationResult: CCFileValidationResult) {
	const errorSymbol = '<i class="fa fa-exclamation-circle"></i> '
	return `<p><strong>${fileValidationResult.fileName}:</strong> ${buildHtmlMessage(errorSymbol, fileValidationResult.errors)}</p>`
}

function buildFileWarningMessage(fileValidationResult: CCFileValidationResult) {
	const warningSymbol = '<i class="fa fa-exclamation-triangle"></i> '
	return `<p><strong>${fileValidationResult.fileName}:</strong> ${buildHtmlMessage(warningSymbol, fileValidationResult.warnings)}</p>`
}

function buildHtmlMessage(symbol: string, validationResult: string[]) {
	return `<p>${validationResult.map(message => symbol + message).join("<br>")}</p>`
}
