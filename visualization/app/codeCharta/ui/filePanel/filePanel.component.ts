import "./filePanel.component.scss"
import { Component, Inject } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"

// Todo:
// - apply partial selection only when at least one is selected
// - effect which ensures that at least one file is selected after file deletion

@Component({
	selector: "cc-file-panel",
	template: require("./filePanel.component.html")
})
export class FilePanelComponent {
	isDeltaState$ = this.store.select(isDeltaStateSelector)

	constructor(@Inject(Store) private store: Store) {}

	// onDeltaReferenceFileChange = (referenceFileName: string) => {
	// 	const rootFile = this._viewModel.files.find(x => x.file.fileMeta.fileName === referenceFileName)
	// 	if (!rootFile) {
	// 		return
	// 	}
	// 	const rootName = rootFile.file.map.name
	// 	CodeChartaService.updateRootData(rootName)
	// 	this.storeService.dispatch(setDeltaByNames(referenceFileName, this._viewModel.selectedFileNames.delta.comparison))
	// }
}
