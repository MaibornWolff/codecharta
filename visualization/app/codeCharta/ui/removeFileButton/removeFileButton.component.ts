import "./removeFileButton.component.scss"
import { removeFile, setMultipleByNames, setSingleByName } from "../../state/store/files/files.actions"
import { removeRecentFile } from "../../state/store/dynamicSettings/recentFiles/recentFiles.actions"
import { StoreService } from "../../state/store.service"
import { FileSelectionState } from "../../model/files/files"
import { CodeChartaService } from "../../codeCharta.service"

export class RemoveFileButtonController {
	private filename: string
	private state: string

	/* @ngInject */
	constructor(private storeService: StoreService) {}

	onRemoveFile($event): void {
		if (this.state === FileSelectionState.Single) this.onSingleRemoveFile($event)
		else this.onPartialRemoveFile($event)
	}

	onSingleRemoveFile($event): void {
		this.storeService.dispatch(removeFile(this.filename))
		this.storeService.dispatch(removeRecentFile(this.filename))

		const remainingFile = this.storeService.getState().files[0].file.fileMeta.fileName
		this.onSingleFileChange(remainingFile)

		$event.stopPropagation()
		$event.preventDefault()
	}

	onPartialRemoveFile($event): void {
		this.storeService.dispatch(removeFile(this.filename))
		this.storeService.dispatch(removeRecentFile(this.filename))

		const allRemainingFiles = this.storeService.getState().files.map(x => x.file.fileMeta.fileName)
		this.onPartialFilesChange(allRemainingFiles)

		$event.stopPropagation()
		$event.preventDefault()
	}

	onSingleFileChange(singleFileName: string) {
		this.storeService.dispatch(setSingleByName(singleFileName))
		const rootName = this.storeService.getState().files.find(x => x.selectedAs === FileSelectionState.Single).file.map.name
		CodeChartaService.updateRootData(rootName)
	}

	onPartialFilesChange(partialFileNames: string[]) {
		if (partialFileNames.length > 0) {
			this.storeService.dispatch(setMultipleByNames(partialFileNames))
		}
	}
}

export const removeFileButtonComponent = {
	selector: "removeFileButtonComponent",
	template: require("./removeFileButton.component.html"),
	controller: RemoveFileButtonController,
	bindings: { filename: "@", state: "@" }
}
