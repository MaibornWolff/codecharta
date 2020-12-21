import "./artificialIntelligence.component.scss"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileSelectionState, FileState } from "../../model/files/files"
import { IRootScopeService } from "angular"

export class ArtificialIntelligenceController implements FilesSelectionSubscriber {
	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		FilesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged(files: FileState[]) {
		for (const fileState of files) {
			if (fileState.selectedAs !== FileSelectionState.None) {
				console.log(fileState)
			}
		}
	}
}

export const artificialIntelligenceComponent = {
	selector: "artificialIntelligenceComponent",
	template: require("./artificialIntelligence.component.html"),
	controller: ArtificialIntelligenceController
}
