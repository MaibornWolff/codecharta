import { CCFileValidationResult } from "../fileValidator"
import { loadFilesValidationToErrorDialog } from "../loadFilesValidationToErrorDialog"

describe("loadFilesValidationToErrorDialog", () => {
	it("should parse file validation result to error dialog data", () => {
		const fileValidationResults: CCFileValidationResult[] = [
			{ fileName: "file_1", errors: ["Error"], warnings: [] },
			{ fileName: "file_2", errors: [], warnings: ["Warning"] }
		]
		const data = loadFilesValidationToErrorDialog(fileValidationResults)
		expect(data.title).toBe("Something is wrong with the uploaded file(s)")
		expect(data.message).toBe(
			'<h2>Errors</h2><p><strong>file_1:</strong> <p><i class="fa fa-exclamation-circle"></i> Error</p></p><h2>Warnings</h2><p><strong>file_2:</strong> <p><i class="fa fa-exclamation-triangle"></i> Warning</p></p>'
		)
	})
})
