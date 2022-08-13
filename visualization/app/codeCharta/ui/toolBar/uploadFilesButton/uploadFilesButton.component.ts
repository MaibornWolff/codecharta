import "./uploadFilesButton.component.scss"
import { Component, Inject } from "@angular/core"
import { CodeChartaService } from "../../../codeCharta.service"
import { CodeChartaServiceToken } from "../../../services/ajs-upgraded-providers"
import { CustomConfigHelper, CUSTOM_CONFIG_FILE_EXTENSION } from "../../../util/customConfigHelper"
import { getCCFileAndDecorateFileChecksum } from "../../../util/fileHelper"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"
import { readFiles } from "../../../util/uploadFiles/readFiles"

@Component({
	selector: "cc-upload-files-button",
	template: require("./uploadFilesButton.component.html")
})
export class UploadFilesButtonComponent {
	constructor(@Inject(CodeChartaServiceToken) private codeChartaService: CodeChartaService) {}

	uploadFiles() {
		const ccFileInput = createCCFileInput()
		ccFileInput.addEventListener("change", async () => {
			const plainFileContents = await Promise.all(readFiles(ccFileInput.files))
			const { customConfigs, ccFiles } = this.splitCustomConfigsAndCCFiles(ccFileInput.files, plainFileContents)

			for (const customConfig of customConfigs) {
				try {
					CustomConfigHelper.importCustomConfigs(customConfig)
				} catch {
					// Explicitly ignored
				}
			}

			if (ccFiles.length > 0) {
				await this.codeChartaService.loadFiles(ccFiles)
			}
		})
		ccFileInput.click()
	}

	private splitCustomConfigsAndCCFiles(fileList: FileList, contents: string[]) {
		const customConfigs = []
		const ccFiles = []

		for (const [index, content] of contents.entries()) {
			const fileName = fileList[index].name
			if (fileName.includes(CUSTOM_CONFIG_FILE_EXTENSION)) {
				customConfigs.push(content)
			} else {
				ccFiles.push({
					fileName,
					fileSize: fileList[index].size,
					content: getCCFileAndDecorateFileChecksum(content)
				})
			}
		}

		return { customConfigs, ccFiles }
	}
}
