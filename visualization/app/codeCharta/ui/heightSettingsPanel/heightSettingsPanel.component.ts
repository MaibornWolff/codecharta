import { IRootScopeService } from "angular"
import { Vector3 } from "three"
import { StoreService } from "../../state/store.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"

export class HeightSettingsPanelController implements FilesSelectionSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedScaling: (newScaling: Vector3) => void

	private _viewModel: {
		scalingY: number
		invertHeight: boolean
		isDeltaState: boolean
	} = {
		scalingY: null,
		invertHeight: null,
		isDeltaState: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
	}
}

export const heightSettingsPanelComponent = {
	selector: "heightSettingsPanelComponent",
	template: require("./heightSettingsPanel.component.html"),
	controller: HeightSettingsPanelController
}
