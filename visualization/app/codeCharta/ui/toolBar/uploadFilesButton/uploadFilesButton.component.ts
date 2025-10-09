import { Component } from "@angular/core"
import { UploadFilesService } from "./uploadFiles.service"
import { ActionIconComponent } from "../../actionIcon/actionIcon.component"

@Component({
    selector: "cc-upload-files-button",
    templateUrl: "./uploadFilesButton.component.html",
    imports: [ActionIconComponent]
})
export class UploadFilesButtonComponent {
    constructor(private readonly uploadFilesService: UploadFilesService) {}

    uploadFiles() {
        this.uploadFilesService.uploadFiles()
    }
}
