import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { UploadFilesService } from "../../services/uploadFiles.service"

@Component({
    selector: "cc-nav-bar-folder-button",
    templateUrl: "./navBarFolderButton.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarFolderButtonComponent {
    private readonly uploadFilesService = inject(UploadFilesService)

    uploadFiles() {
        this.uploadFilesService.uploadFiles()
    }
}
