import "./legendMarkedPackages.component.scss"
import angular, { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../../codeMap/codeMap.actions.service"
import { MarkedPackage } from "../../../codeCharta.model"
import { MarkedPackagesSubscriber, MarkedPackagesService } from "../../../state/store/fileSettings/markedPackages/markedPackages.service"
import { getReadableColorForBackground, hasValidHexLength, normalizeHex } from "../../customColorPicker/colorHelper"

type Path = string
interface MarkedPackagesMap {
	[color: string]: Path[]
}

export class LegendPanelController implements MarkedPackagesSubscriber {
	private _viewModel: {
		packageLists: MarkedPackagesMap
	} = {
		packageLists: {}
	}

	// @ts-ignore TS6133 - used by rendered color-picker
	private _colorPickerScopes = {}

	constructor(
		private $rootScope: IRootScopeService,
		private $scope,
		private $element,
		private $timeout,
		private codeMapActionsService: CodeMapActionsService
	) {
		MarkedPackagesService.subscribe(this.$rootScope, this)
	}

	onMarkedPackagesChanged(markedPackages: MarkedPackage[]) {
		this._viewModel.packageLists = this.calculatePackageLists(markedPackages)

		this._colorPickerScopes = this.calculateColorPickerScopes(this._viewModel.packageLists)

		this.updateBrushesColor()
	}

	$onInit() {
		this.$scope.colorPickerEventApi = {
			onChange: (api, newColor) => {
				if (!hasValidHexLength(newColor)) return

				newColor = normalizeHex(newColor)

				this.updateViewModelPackageList(api.getElement().scope().color, newColor)

				this._viewModel.packageLists[newColor].forEach(path => {
					this.codeMapActionsService.markFolder({ path }, newColor)
				})
			}
		}
	}

	private updateBrushesColor() {
		// wait for color-pickers to be updated
		this.$timeout(() => {
			for (const colorPicker of this.$element[0].querySelectorAll("color-picker")) {
				const colorPickersColor = normalizeHex((angular.element(colorPicker).scope() as any).color)
				const brushIcon = colorPicker.querySelector(".cc-color-picker-swatch-brush-icon") as HTMLElement
				brushIcon.style.color = getReadableColorForBackground(colorPickersColor)
			}
		})
	}

	private calculatePackageLists(markedPackages: MarkedPackage[]) {
		return markedPackages.reduce((acc, markedPackage) => {
			if (!acc.hasOwnProperty(markedPackage.color)) acc[markedPackage.color] = []
			acc[markedPackage.color].push(markedPackage.path)
			return acc
		}, {})
	}

	private calculateColorPickerScopes(packageLists: MarkedPackagesMap) {
		return Object.entries(packageLists).reduce((acc, [color, paths]) => {
			acc[paths[0]] = color
			return acc
		}, {})
	}

	private updateViewModelPackageList(oldColor: string, newColor: string) {
		this._viewModel.packageLists[newColor] = this._viewModel.packageLists[oldColor]
		delete this._viewModel.packageLists[oldColor]
	}
}

export const legendMarkedPackagesComponent = {
	selector: "ccLegendMarkedPackagesComponent",
	template: require("./legendMarkedPackages.component.html"),
	controller: LegendPanelController
}
