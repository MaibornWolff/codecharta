import { Component, Inject } from "@angular/core"
import { CodeChartaService } from "../../../codeCharta.service"
import { CodeChartaServiceToken } from "../../../services/ajs-upgraded-providers"
import { getCCFileAndDecorateFileChecksum } from "../../../util/fileHelper"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"
import { readFiles } from "../../../util/uploadFiles/readFiles"

@Component({
	selector: "cc-upload-files-button",
	template: require("./uploadFilesButton.component.html")
})
export class UploadFilesButtonComponent {
	constructor(@Inject(CodeChartaServiceToken) private codeChartaService: CodeChartaService) {}

	async uploadFiles() {
		const ccFileInput = createCCFileInput()
		ccFileInput.addEventListener("change", async () => {
			const plainFileContents = await Promise.all(readFiles(ccFileInput.files))
			const ccFiles = plainFileContents.map((jsonString, index) => ({
				fileName: ccFileInput.files[index].name,
				fileSize: ccFileInput.files[index].size,
				content: getCCFileAndDecorateFileChecksum(jsonString)
			}))
			this.codeChartaService.loadFiles(ccFiles)
		})
		ccFileInput.click()
	}
}
