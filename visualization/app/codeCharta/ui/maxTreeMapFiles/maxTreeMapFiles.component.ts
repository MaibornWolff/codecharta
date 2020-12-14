import "./maxTreeMapFiles.component.scss"
import { MaxTreeMapFilesSubscriber, MaxTreeMapFilesService } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setMaxTreeMapFiles } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"

export class MaxTreeMapFilesController implements MaxTreeMapFilesSubscriber {
	private _viewModel: {
		maxTreeMapFiles: number
	} = {
		maxTreeMapFiles: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		MaxTreeMapFilesService.subscribe(this.$rootScope, this)
		const maxTreeMapFiles = this.storeService.getState().appSettings.maxTreeMapFiles
		this.onMaxTreeMapFilesChanged(maxTreeMapFiles)
		this._viewModel.maxTreeMapFiles = maxTreeMapFiles
	}

	onMaxTreeMapFilesChanged(maxTreeMapFiles: number) {
		this._viewModel.maxTreeMapFiles = maxTreeMapFiles
	}

	onChangeMaxTreeMapFilesSlider() {
		this.storeService.dispatch(setMaxTreeMapFiles(this._viewModel.maxTreeMapFiles))
	}
}

export const maxTreeMapFilesComponent = {
	selector: "maxTreeMapFilesComponent",
	template: require("./maxTreeMapFiles.component.html"),
	controller: MaxTreeMapFilesController
}
