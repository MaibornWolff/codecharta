import "./areaSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { FileState } from "../../codeCharta.model"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { StoreService } from "../../state/store.service"
import { setDynamicMargin } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import _ from "lodash"
import { DynamicMarginService, DynamicMarginSubscriber } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.service"
import { MarginService, MarginSubscriber } from "../../state/store/dynamicSettings/margin/margin.service"

export class AreaSettingsPanelController implements FileStateServiceSubscriber, DynamicMarginSubscriber, MarginSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedMargin: () => void

	private _viewModel: {
		margin: number
		dynamicMargin: boolean
	} = {
		margin: null,
		dynamicMargin: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		DynamicMarginService.subscribe(this.$rootScope, this)
		MarginService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)

		this.applyDebouncedMargin = _.debounce(() => {
			this.storeService.dispatch(setMargin(this._viewModel.margin))
		}, AreaSettingsPanelController.DEBOUNCE_TIME)
	}

	public onDynamicMarginChanged(dynamicMargin: boolean) {
		this._viewModel.dynamicMargin = dynamicMargin
	}

	public onMarginChanged(margin: number) {
		this._viewModel.margin = margin
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this._viewModel.dynamicMargin = true
		this.applyDynamicMargin()
	}

	private applyDynamicMargin() {
		this.storeService.dispatch(setDynamicMargin(this._viewModel.dynamicMargin))
	}

	public onChangeMarginSlider() {
		this.applyDebouncedMargin()
		this.storeService.dispatch(setDynamicMargin(false))
	}
}

export const areaSettingsPanelComponent = {
	selector: "areaSettingsPanelComponent",
	template: require("./areaSettingsPanel.component.html"),
	controller: AreaSettingsPanelController
}
