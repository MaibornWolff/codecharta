import { Component, ViewEncapsulation } from "@angular/core"
import { UploadFilesService } from "./uploadFiles.service"

@Component({
    selector: "cc-upload-files-button",
    templateUrl: "./uploadFilesButton.component.html",
    styleUrls: ["./uploadFilesButton.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class UploadFilesButtonComponent {
    constructor(private uploadFilesService: UploadFilesService) {}

    uploadFiles() {
        this.uploadFilesService.uploadFiles()
    }
}
