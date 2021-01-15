import "./legendMarkedPackages.component.scss"
import { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../../codeMap/codeMap.actions.service"
import { MarkedPackage } from "../../../codeCharta.model"
import { MarkedPackagesSubscriber, MarkedPackagesService } from "../../../state/store/fileSettings/markedPackages/markedPackages.service"
import { hasValidHexLength, normalizeHex } from "../../customColorPicker/colorHelper"

type Path = string
interface MarkedPackageMap {
	[color: string]: Path[]
}

export class LegendPanelController implements MarkedPackagesSubscriber {
	private _viewModel: {
		packageLists: MarkedPackageMap
	} = {
		packageLists: {}
	}

	private _colorPickerScopes = {}

	constructor(private $rootScope: IRootScopeService, private $scope, private codeMapActionsService: CodeMapActionsService) {
		this.$scope._colorPickerScopes = {}
		MarkedPackagesService.subscribe(this.$rootScope, this)
	}

	onMarkedPackagesChanged(markedPackages: MarkedPackage[]) {
		console.log(this.$scope, this._colorPickerScopes)
		this._viewModel.packageLists = markedPackages.reduce((acc, markedPackage) => {
			if (!acc.hasOwnProperty(markedPackage.color)) acc[markedPackage.color] = []
			acc[markedPackage.color].push(markedPackage.path)
			return acc
		}, {})

		this._colorPickerScopes = Object.entries(this._viewModel.packageLists).reduce((acc, [color, paths]) => {
			acc[paths[0]] = color
			return acc
		}, {})
	}

	$onInit() {
		this.$scope.colorPickerEventApi = {
			onChange: (api, newColor) => {
				if (!hasValidHexLength(newColor)) return

				newColor = normalizeHex(newColor)
				const oldColor = api.getElement().scope().color
				this._viewModel.packageLists[newColor] = this._viewModel.packageLists[oldColor]
				delete this._viewModel.packageLists[oldColor]

				this._viewModel.packageLists[newColor].forEach(path => {
					this.codeMapActionsService.markFolder({ path }, newColor)
				})
			}
		}
	}
}

export const legendMarkedPackagesComponent = {
	selector: "ccLegendMarkedPackagesComponent",
	template: require("./legendMarkedPackages.component.html"),
	controller: LegendPanelController
}
