import "./removeFileButton.component.scss"
import { removeFile, setSingleByName } from "../../state/store/files/files.actions"
import { removeRecentFile } from "../../state/store/dynamicSettings/recentFiles/recentFiles.actions"
import { StoreService } from "../../state/store.service"
import { FileSelectionState } from "../../model/files/files"
import { CodeChartaService } from "../../codeCharta.service"

export class RemoveFileButtonController {
	private filename: string

	/* @ngInject */
	constructor(private storeService: StoreService) {}

	onSingleRemoveFile($event): void {
		this.storeService.dispatch(removeFile(this.filename))
		this.storeService.dispatch(removeRecentFile(this.filename))

		const remainingFile = this.storeService.getState().files[0].file.fileMeta.fileName
		this.onSingleFileChange(remainingFile)

		$event.stopPropagation()
		$event.preventDefault()
	}

	onSingleFileChange(singleFileName: string) {
		this.storeService.dispatch(setSingleByName(singleFileName))
		const rootName = this.storeService.getState().files.find(x => x.selectedAs === FileSelectionState.Single).file.map.name
		CodeChartaService.updateRootData(rootName)
	}
}

export const removeFileButtonComponent = {
	selector: "removeFileButtonComponent",
	template: require("./removeFileButton.component.html"),
	controller: RemoveFileButtonController,
	bindings: { filename: "@" }
}
