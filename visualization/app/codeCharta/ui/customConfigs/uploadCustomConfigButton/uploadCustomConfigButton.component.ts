import { Component, ViewEncapsulation } from "@angular/core"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"
import { readFiles } from "../../../util/uploadFiles/readFiles"

@Component({
	selector: "cc-upload-custom-config-button",
	templateUrl: "./uploadCustomConfigButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class UploadCustomConfigButtonComponent {
	upload() {
		const fileInput = createCCFileInput()
		fileInput.addEventListener("change", () => {
			void this.uploadOnEvent(fileInput)
		})
		fileInput.click()
	}

	private async uploadOnEvent(fileInput: HTMLInputElement) {
		const customConfigsContent = await Promise.all(readFiles(fileInput.files))
		for (const customConfigContent of customConfigsContent) {
			try {
				CustomConfigHelper.importCustomConfigs(customConfigContent)
			} catch {
				// Explicitly ignored
			}
		}
	}
}
