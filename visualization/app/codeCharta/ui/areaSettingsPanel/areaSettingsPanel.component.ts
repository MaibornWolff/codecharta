import "./areaSettingsPanel.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setDynamicMargin } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.actions"
import { setMargin } from "../../state/store/dynamicSettings/margin/margin.actions"
import debounce from "lodash.debounce"
import { DynamicMarginService, DynamicMarginSubscriber } from "../../state/store/appSettings/dynamicMargin/dynamicMargin.service"
import { MarginService, MarginSubscriber } from "../../state/store/dynamicSettings/margin/margin.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"

export class AreaSettingsPanelController implements FilesSelectionSubscriber, DynamicMarginSubscriber, MarginSubscriber {
	private static DEBOUNCE_TIME = 400
	private readonly applyDebouncedMargin: () => void

	private _viewModel: {
		margin: number
		dynamicMargin: boolean
	} = {
		margin: null,
		dynamicMargin: null
	}

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		DynamicMarginService.subscribe(this.$rootScope, this)
		MarginService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)

		this.applyDebouncedMargin = debounce(() => {
			this.storeService.dispatch(setMargin(this._viewModel.margin))
		}, AreaSettingsPanelController.DEBOUNCE_TIME)
	}

	onDynamicMarginChanged(dynamicMargin: boolean) {
		this._viewModel.dynamicMargin = dynamicMargin
	}

	onMarginChanged(margin: number) {
		this._viewModel.margin = margin
	}

	onFilesSelectionChanged() {
		this._viewModel.dynamicMargin = true
		this.applyDynamicMargin()
	}

	private applyDynamicMargin() {
		this.storeService.dispatch(setDynamicMargin(this._viewModel.dynamicMargin))
	}

	onChangeMarginSlider() {
		this.applyDebouncedMargin()
		this.storeService.dispatch(setDynamicMargin(false))
	}
}

export const areaSettingsPanelComponent = {
	selector: "areaSettingsPanelComponent",
	template: require("./areaSettingsPanel.component.html"),
	controller: AreaSettingsPanelController
}
