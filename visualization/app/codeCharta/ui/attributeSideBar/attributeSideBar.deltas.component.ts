import "./attributeSideBar.component.scss"
import { Settings, RecursivePartial } from "../../codeCharta.model"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { BuildingSelectedEventSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { SettingsService } from "../../state/settingsService/settings.service"
import { SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"

export class AttributeSideBarDeltasController implements BuildingSelectedEventSubscriber, SettingsServiceSubscriber {
	private static TIME_TO_INIT_BINDING: number = 50
	private attributekey: string

	private _viewModel: {
		deltaValue: number
		colorClass: string
		attributekey: string
	} = {
		deltaValue: null,
		colorClass: null,
		attributekey: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private $timeout: ITimeoutService,
		private threeSceneService: ThreeSceneService,
		private settingsService: SettingsService
	) {
		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		SettingsService.subscribe(this.$rootScope, this)
		this.$timeout(() => {
			this.onBuildingSelected(this.threeSceneService.getSelectedBuilding())
		}, AttributeSideBarDeltasController.TIME_TO_INIT_BINDING)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this.setDeltaValue(selectedBuilding)
		this.setDeltaColorClass(this.settingsService.getSettings())
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		if (update.appSettings && update.appSettings.invertDeltaColors !== undefined) {
			this.setDeltaColorClass(settings)
		}
	}

	private setDeltaValue(selectedBuilding: CodeMapBuilding) {
		if (selectedBuilding) {
			const deltas = selectedBuilding.node.deltas
			this._viewModel.deltaValue = deltas ? deltas[this.attributekey] : null
		}
	}

	private setDeltaColorClass(settings: Settings) {
		if (settings.appSettings.invertDeltaColors) {
			this._viewModel.colorClass = this._viewModel.deltaValue > 0 ? "red" : "green"
		} else {
			this._viewModel.colorClass = this._viewModel.deltaValue > 0 ? "green" : "red"
		}
	}
}

export const attributeSideBarDeltasComponent = {
	selector: "attributeSideBarDeltasComponent",
	template: require("./attributeSideBar.deltas.component.html"),
	controller: AttributeSideBarDeltasController,
	bindings: {
		attributekey: "="
	}
}
