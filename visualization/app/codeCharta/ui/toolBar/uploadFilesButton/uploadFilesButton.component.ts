import { Component } from "@angular/core"
import { UploadFilesService } from "./uploadFiles.service"

@Component({
    selector: "cc-upload-files-button",
    templateUrl: "./uploadFilesButton.component.html"
})
export class UploadFilesButtonComponent {
    constructor(private uploadFilesService: UploadFilesService) {}

    uploadFiles() {
        this.uploadFilesService.uploadFiles()
    }
}
