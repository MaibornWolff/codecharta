import { Component, Input } from "@angular/core"
import { FileState } from "../../../model/files/files"

@Component({
	selector: "cc-file-panel-file-selector",
	template: require("./filePanelFileSelector.component.html")
})
export class FilePanelFileSelectorComponent {
	@Input() files: FileState[]
	@Input() selectedFileNames: string[]
	@Input() handleSelectedFilesChanged: (selectedFileNames: string[]) => void
}
