import { KindOfMap, Settings, SettingsService, SettingsServiceSubscriber } from "../../core/settings/settings.service"
import { codeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { KVObject } from "../../core/data/data.deltaCalculator.service"
import { DataService } from "../../core/data/data.service"
import "./detailPanel.component.scss"
import {
	CodeMapBuildingTransition,
	CodeMapMouseEventService,
	CodeMapMouseEventServiceSubscriber
} from "../codeMap/codeMap.mouseEvent.service"

interface CommonDetails {
	areaAttributeName: string | null
	heightAttributeName: string | null
	colorAttributeName: string | null
}

interface SpecificDetails {
	name: string | null
	area: number | null
	height: number | null
	color: number | null
	heightDelta: number | null
	areaDelta: number | null
	colorDelta: number | null
	link: string | null
	origin: string | null
	path: string | null
	attributes: KVObject | null
	deltas: KVObject | null
}

interface Details {
	common: CommonDetails
	hovered: SpecificDetails
	selected: SpecificDetails
}

export class DetailPanelController implements SettingsServiceSubscriber, CodeMapMouseEventServiceSubscriber {
	public details: Details
	private settings: Settings

	/* @ngInject */
	constructor(private $rootScope, private settingsService: SettingsService, private dataService: DataService, private $timeout) {
		this.details = {
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

		this.settings = settingsService.settings

		// we can use watches here again... we try to keep watches as shallow and small as possible
		this.onSettingsChanged(settingsService.settings)

		this.settingsService.subscribe(this)
		CodeMapMouseEventService.subscribe($rootScope, this)
	}

	onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
		this.onHover(data)
	}

	onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
		this.onSelect(data)
	}

	onBuildingRightClicked(building: codeMapBuilding, x: number, y: number, event: angular.IAngularEvent) {}

	onSettingsChanged(settings: Settings) {
		this.details.common.areaAttributeName = settings.areaMetric
		this.details.common.heightAttributeName = settings.heightMetric
		this.details.common.colorAttributeName = settings.colorMetric
	}

	onSelect(data) {
		if (data.to && data.to.node) {
			this.setSelectedDetails(data.to.node)
		} else {
			this.clearSelectedDetails()
		}
	}

	onHover(data) {
		if (data.to && data.to.node) {
			this.setHoveredDetails(data.to.node)
		} else {
			this.clearHoveredDetails()
		}
	}

	isHovered() {
		if (this.details && this.details.hovered) {
			return this.details.hovered.name ? true : false
		} else {
			return false
		}
	}

	isSelected() {
		if (this.details && this.details.selected) {
			return this.details.selected.name ? true : false
		} else {
			return false
		}
	}

	setHoveredDetails(hovered) {
		this.clearHoveredDetails()
		this.$timeout(
			function() {
				this.details.hovered.name = hovered.name
				if (hovered.mode != undefined && this.settings.mode == KindOfMap.Delta) {
					this.details.hovered.heightDelta = hovered.deltas ? hovered.deltas[this.details.common.heightAttributeName] : null
					this.details.hovered.areaDelta = hovered.deltas ? hovered.deltas[this.details.common.areaAttributeName] : null
					this.details.hovered.colorDelta = hovered.deltas ? hovered.deltas[this.details.common.colorAttributeName] : null
					this.details.hovered.deltas = hovered.deltas
				}
				if (hovered.attributes != undefined) {
					this.details.hovered.area = hovered.attributes ? hovered.attributes[this.details.common.areaAttributeName] : null
					this.details.hovered.height = hovered.attributes ? hovered.attributes[this.details.common.heightAttributeName] : null
					this.details.hovered.color = hovered.attributes ? hovered.attributes[this.details.common.colorAttributeName] : null
					this.details.hovered.attributes = hovered.attributes
				}
				this.details.hovered.link = hovered.link
				this.details.hovered.origin = hovered.origin
				this.details.hovered.path = this.getPathFromCodeMapBuilding(hovered)
			}.bind(this)
		)
	}

	private getPathFromCodeMapBuilding(b: codeMapBuilding): string {
		let current = b
		let result = ""
		while (current) {
			result = "/" + current.name + result
			current = current.parent
		}
		return result
	}

	setSelectedDetails(selected) {
		this.clearSelectedDetails()
		this.$timeout(
			function() {
				this.details.selected.name = selected.name
				if (selected.attributes != undefined) {
					this.details.selected.area = selected.attributes ? selected.attributes[this.details.common.areaAttributeName] : null
					this.details.selected.height = selected.attributes ? selected.attributes[this.details.common.heightAttributeName] : null
					this.details.selected.color = selected.attributes ? selected.attributes[this.details.common.colorAttributeName] : null
					this.details.selected.attributes = selected.attributes
				}
				if (selected.deltas != undefined && this.settings.mode == KindOfMap.Delta) {
					this.details.selected.heightDelta = selected.deltas ? selected.deltas[this.details.common.heightAttributeName] : null
					this.details.selected.areaDelta = selected.deltas ? selected.deltas[this.details.common.areaAttributeName] : null
					this.details.selected.colorDelta = selected.deltas ? selected.deltas[this.details.common.colorAttributeName] : null
					this.details.selected.deltas = selected.deltas
				}
				this.details.selected.link = selected.link
				this.details.selected.origin = selected.origin
				this.details.selected.path = this.getPathFromCodeMapBuilding(selected)
			}.bind(this)
		)
	}

	clearHoveredDetails() {
		this.$timeout(
			function() {
				for (let key in this.details.hovered) {
					this.details.hovered[key] = null
				}
			}.bind(this)
		)
	}

	clearSelectedDetails() {
		this.$timeout(
			function() {
				for (let key in this.details.selected) {
					this.details.selected[key] = null
				}
			}.bind(this)
		)
	}
}

export const detailPanelComponent = {
	selector: "detailPanelComponent",
	template: require("./detailPanel.component.html"),
	controller: DetailPanelController
}
