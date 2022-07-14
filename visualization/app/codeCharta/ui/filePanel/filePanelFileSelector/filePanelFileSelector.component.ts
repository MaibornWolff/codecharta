import "./filePanelFileSelector.component.scss"
import { Component, Inject, OnDestroy } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { filesSelector } from "../../../state/store/files/files.selector"
import { map, tap } from "rxjs"
import { invertStandard, setAll, setStandard } from "../../../state/store/files/files.actions"
import { CCFile } from "../../../codeCharta.model"

@Component({
	selector: "cc-file-panel-file-selector",
	template: require("./filePanelFileSelector.component.html")
})
export class FilePanelFileSelectorComponent implements OnDestroy {
	files$ = this.store.select(filesSelector)
	selectedFiles: CCFile[] = []
	private selectedFilesSubscription = this.files$
		.pipe(
			map(files => files.filter(file => file.selectedAs === "Partial").map(file => file.file)),
			tap(files => {
				this.selectedFiles = files
			})
		)
		.subscribe()

	constructor(@Inject(Store) private store: Store) {}

	ngOnDestroy(): void {
		this.selectedFilesSubscription.unsubscribe()
	}

	handleSelectedFilesChanged(selectedFiles: CCFile[]) {
		this.selectedFiles = selectedFiles
		if (selectedFiles.length > 0) {
			this.store.dispatch(setStandard(selectedFiles))
		}
	}

	handleSelectZeroFiles() {
		this.selectedFiles = []
	}

	handleInvertSelectedFiles() {
		this.store.dispatch(invertStandard())
	}

	handleSelectAllFiles() {
		this.store.dispatch(setAll())
	}
}
