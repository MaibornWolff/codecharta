import "./filePanelFileSelector.component.scss"
import { Component, Inject, Input } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { filesSelector } from "../../../state/store/files/files.selector"
@Component({
	selector: "cc-file-panel-file-selector",
	template: require("./filePanelFileSelector.component.html")
})
export class FilePanelFileSelectorComponent {
	files$ = this.store.select(filesSelector)
	@Input() selectedFileNames: string[]
	@Input() handleSelectedFilesChanged: (selectedFileNames: string[]) => void
	@Input() handleSelectAllPartialFiles: () => void
	@Input() handleSelectZeroPartialFiles: () => void
	@Input() handleInvertSelectedPartialFiles: () => void
	@Input() handleOnSelectionClosed: () => void
	@Input() handleOnRemoveFile: (filename: string, event) => void

	constructor(@Inject(Store) private store: Store) {}
}
