import { Component, Inject } from "@angular/core"
import { CodeChartaService } from "../../../codeCharta.service"
import { CodeChartaServiceToken } from "../../../services/ajs-upgraded-providers"
import { uploadCCFiles } from "../../../util/uploadFiles/uploadCCFiles"

@Component({
	selector: "cc-upload-files-button",
	template: require("./uploadFilesButton.component.html")
})
export class UploadFilesButton {
	constructor(@Inject(CodeChartaServiceToken) private codeChartaService: CodeChartaService) {}

	async uploadFiles() {
		const ccFiles = await uploadCCFiles()
		this.codeChartaService.loadFiles(ccFiles)
	}
}
