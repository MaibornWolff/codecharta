import { Component, Inject } from "@angular/core"
import { UploadFilesService } from "./uploadFiles.service"

@Component({
	selector: "cc-upload-files-button",
	template: require("./uploadFilesButton.component.html")
})
export class UploadFilesButtonComponent {
	constructor(@Inject(UploadFilesService) private uploadFilesService) {}

	uploadFiles() {
		this.uploadFilesService.uploadFiles()
	}
}
