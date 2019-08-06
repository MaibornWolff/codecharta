import { BlacklistSubscriber, SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import "./detailPanel.component.scss"
import {
	BuildingHoveredEventSubscriber,
	BuildingSelectedEventSubscriber,
	CodeMapBuildingTransition,
	CodeMapMouseEventService
} from "../codeMap/codeMap.mouseEvent.service"
import { Settings, KeyValuePair, MetricData, RecursivePartial, BlacklistItem } from "../../codeCharta.model"
import { Node } from "../../codeCharta.model"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { FileStateService } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"

interface CommonDetails {
	areaAttributeName: string
	heightAttributeName: string
	colorAttributeName: string
}

interface SpecificDetails {
	name: string
	area: number
	height: number
	color: number
	heightDelta: number
	areaDelta: number
	colorDelta: number
	link: string
	origin: string
	path: string
	attributes: KeyValuePair
	deltas: KeyValuePair
}

interface Details {
	common: CommonDetails
	hovered: SpecificDetails
	selected: SpecificDetails
}

export class DetailPanelController
	implements
		SettingsServiceSubscriber,
		BuildingHoveredEventSubscriber,
		BuildingSelectedEventSubscriber,
		MetricServiceSubscriber,
		BlacklistSubscriber {
	private _viewModel: {
		maximizeDetailPanel: boolean
		metrics: string[]
		details: Details
	} = {
		maximizeDetailPanel: null,
		metrics: [],
		details: {
			common: {
				areaAttributeName: null,
				heightAttributeName: null,
				colorAttributeName: null
			},
			hovered: {
				name: null,
				area: null,
				height: null,
				color: null,
				heightDelta: null,
				areaDelta: null,
				colorDelta: null,
				link: null,
				origin: null,
				path: null,
				attributes: null,
				deltas: null
			},
			selected: {
				name: null,
				area: null,
				height: null,
				color: null,
				heightDelta: null,
				areaDelta: null,
				colorDelta: null,
				link: null,
				origin: null,
				path: null,
				attributes: null,
				deltas: null
			}
		}
	}

	/* @ngInject */
	constructor(
		private $rootScope,
		private settingsService: SettingsService,
		private $timeout,
		private fileStateService: FileStateService
	) {
		MetricService.subscribe(this.$rootScope, this)
		SettingsService.subscribe(this.$rootScope, this)
		SettingsService.subscribeToBlacklist(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		this._viewModel.metrics = metricData.map(x => x.name)
	}

	public onMetricDataRemoved() {}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		this.onHover(data)
	}

	public onBuildingSelected(data: CodeMapBuildingTransition) {
		this.onSelect(data)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this._viewModel.details.common.areaAttributeName = settings.dynamicSettings.areaMetric
		this._viewModel.details.common.heightAttributeName = settings.dynamicSettings.heightMetric
		this._viewModel.details.common.colorAttributeName = settings.dynamicSettings.colorMetric
		this._viewModel.maximizeDetailPanel = settings.appSettings.maximizeDetailPanel
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.clearSelectedDetails()
		this.clearHoveredDetails()
	}

	public onSelect(data: CodeMapBuildingTransition) {
		if (data.to && data.to.node) {
			this.setSelectedDetails(data.to.node)
		} else {
			this.clearSelectedDetails()
		}
	}

	public onHover(data: CodeMapBuildingTransition) {
		if (data.to && data.to.node) {
			this.setHoveredDetails(data.to.node)
		} else {
			this.clearHoveredDetails()
		}
	}

	public isHovered() {
		if (this._viewModel.details && this._viewModel.details.hovered) {
			return !!this._viewModel.details.hovered.name
		} else {
			return false
		}
	}

	public isSelected() {
		if (this._viewModel.details && this._viewModel.details.selected) {
			return !!this._viewModel.details.selected.name
		} else {
			return false
		}
	}

	public setHoveredDetails(hovered: Node) {
		this.clearHoveredDetails()
		this.$timeout(() => {
			this._viewModel.details.hovered.name = hovered.name
			if (hovered.attributes) {
				this._viewModel.details.hovered.area = hovered.attributes[this._viewModel.details.common.areaAttributeName]
				this._viewModel.details.hovered.height = hovered.attributes[this._viewModel.details.common.heightAttributeName]
				this._viewModel.details.hovered.color = hovered.attributes[this._viewModel.details.common.colorAttributeName]
				this._viewModel.details.hovered.attributes = hovered.attributes
			}

			if (hovered.deltas && FileStateHelper.isDeltaState(this.fileStateService.getFileStates())) {
				this._viewModel.details.hovered.heightDelta = hovered.deltas[this._viewModel.details.common.heightAttributeName]
				this._viewModel.details.hovered.areaDelta = hovered.deltas[this._viewModel.details.common.areaAttributeName]
				this._viewModel.details.hovered.colorDelta = hovered.deltas[this._viewModel.details.common.colorAttributeName]
				this._viewModel.details.hovered.deltas = hovered.deltas
			}

			this._viewModel.details.hovered.link = hovered.link
			this._viewModel.details.hovered.origin = hovered.origin
			this._viewModel.details.hovered.path = hovered.path
		})
	}

	public setSelectedDetails(selected: Node) {
		this.clearSelectedDetails()
		this.$timeout(() => {
			this._viewModel.details.selected.name = selected.name
			if (selected.attributes) {
				this._viewModel.details.selected.area = selected.attributes[this._viewModel.details.common.areaAttributeName]
				this._viewModel.details.selected.height = selected.attributes[this._viewModel.details.common.heightAttributeName]
				this._viewModel.details.selected.color = selected.attributes[this._viewModel.details.common.colorAttributeName]
				this._viewModel.details.selected.attributes = selected.attributes
			}
			if (selected.deltas && FileStateHelper.isDeltaState(this.fileStateService.getFileStates())) {
				this._viewModel.details.selected.heightDelta = selected.deltas[this._viewModel.details.common.heightAttributeName]
				this._viewModel.details.selected.areaDelta = selected.deltas[this._viewModel.details.common.areaAttributeName]
				this._viewModel.details.selected.colorDelta = selected.deltas[this._viewModel.details.common.colorAttributeName]
				this._viewModel.details.selected.deltas = selected.deltas
			}
			this._viewModel.details.selected.link = selected.link
			this._viewModel.details.selected.origin = selected.origin
			this._viewModel.details.selected.path = selected.path
		})
	}

	public clearHoveredDetails() {
		this.$timeout(() => {
			for (let key in this._viewModel.details.hovered) {
				this._viewModel.details.hovered[key] = null
			}
		})
	}

	public clearSelectedDetails() {
		this.$timeout(() => {
			for (let key in this._viewModel.details.selected) {
				this._viewModel.details.selected[key] = null
			}
		})
	}

	public toggleDetailPanel() {
		this.settingsService.updateSettings({
			appSettings: {
				maximizeDetailPanel: !this._viewModel.maximizeDetailPanel
			}
		})
	}
}

export const detailPanelComponent = {
	selector: "detailPanelComponent",
	template: require("./detailPanel.component.html"),
	controller: DetailPanelController
}
