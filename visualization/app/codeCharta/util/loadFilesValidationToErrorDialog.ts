import { CCFileValidationResult } from "./fileValidator"

export function loadFilesValidationToErrorDialog(fileValidationResults: CCFileValidationResult[]) {
	const htmlMessages = []

	const filesWithErrors = fileValidationResults.filter(validationResult => validationResult.errors.length > 0)
	if (filesWithErrors.length > 0) {
		htmlMessages.push("<h2>Errors</h2>")
		for (const fileWithErrors of filesWithErrors) {
			const fileErrorMessage = buildFileErrorMessage(fileWithErrors)
			htmlMessages.push(fileErrorMessage)
		}
	}

	const filesWithWarnings = fileValidationResults.filter(validationResult => validationResult.warnings.length > 0)
	if (filesWithWarnings.length > 0) {
		htmlMessages.push("<h2>Warnings</h2>")
		for (const fileWithWarnings of filesWithWarnings) {
			const fileWarningMessage = buildFileWarningMessage(fileWithWarnings)
			htmlMessages.push(fileWarningMessage)
		}
	}

	return {
		title: "Something is wrong with the uploaded file(s)",
		message: htmlMessages.join("")
	}
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
