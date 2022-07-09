import "./filePanelFileSelector.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { filesSelector } from "../../../state/store/files/files.selector"
import { map } from "rxjs"
import { invertStandard, setStandard } from "../../../state/store/files/files.actions"
import { CCFile } from "../../../codeCharta.model"

@Component({
	selector: "cc-file-panel-file-selector",
	template: require("./filePanelFileSelector.component.html")
})
export class FilePanelFileSelectorComponent {
	files$ = this.store.select(filesSelector)
	selectedFiles$ = this.files$.pipe(map(files => files.filter(file => file.selectedAs === "Partial").map(file => file.file)))

	constructor(@Inject(Store) private store: Store) {}

	handleSelectedFilesChanged(selectedFiles: CCFile[]) {
		this.store.dispatch(setStandard(selectedFiles))
	}

	handleSelectZeroPartialFiles() {
		this.store.dispatch(setStandard([]))
	}

	handleInvertSelectedPartialFiles() {
		this.store.dispatch(invertStandard())
	}
}
