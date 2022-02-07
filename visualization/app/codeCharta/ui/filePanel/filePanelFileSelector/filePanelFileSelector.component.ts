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
	@Input() handleSelectAllPartialFiles: () => void
	@Input() handleSelectZeroPartialFiles: () => void
	@Input() handleInvertSelectedPartialFiles: () => void
	@Input() handleOnSelectionClosed: () => void
	@Input() handleOnRemoveFile: (filename: string, event) => void
}
