import $ from "jquery"
import { IRootScopeService } from "angular"
import "./legendPanel.component.scss"
import { ColorRange, MarkedPackage } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { FileStateService } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { ColorConverter } from "../../util/color/colorConverter"
import { AttributeSideBarService, AttributeSideBarVisibilitySubscriber } from "../attributeSideBar/attributeSideBar.service"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import {
	InvertColorRangeService,
	InvertColorRangeSubscriber
} from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { StoreService } from "../../state/store.service"
import { MarkedPackagesSubscriber } from "../../state/store/fileSettings/markedPackages/markedPackages.service"

export interface PackageList {
	colorPixel: string
	markedPackages: MarkedPackage[]
}

export class LegendPanelController
	implements AttributeSideBarVisibilitySubscriber, ColorRangeSubscriber, InvertColorRangeSubscriber, MarkedPackagesSubscriber {
	private _viewModel: {
		isLegendVisible: boolean
		isSideBarVisible: boolean
		isDeltaState: boolean
		colorRange: ColorRange
		invertColorRange: boolean
		packageLists: PackageList[]
	} = {
		isLegendVisible: false,
		isSideBarVisible: null,
		isDeltaState: null,
		colorRange: null,
		invertColorRange: null,
		packageLists: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private fileStateService: FileStateService) {
		ColorRangeService.subscribe(this.$rootScope, this)
		InvertColorRangeService.subscribe(this.$rootScope, this)
		AttributeSideBarService.subscribe(this.$rootScope, this)
	}

	public onColorRangeChanged(colorRange: ColorRange) {
		this._viewModel.colorRange = colorRange
		this.updatePixelColors()
	}

	public onInvertColorRangeChanged(invertColorRange: boolean) {
		this._viewModel.invertColorRange = invertColorRange
		this.updatePixelColors()
	}

	public onMarkedPackagesChanged(markedPackages: MarkedPackage[]) {
		this.setMarkedPackageLists(markedPackages)
	}

	public onAttributeSideBarVisibilityChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	public toggle() {
		this._viewModel.isLegendVisible = !this._viewModel.isLegendVisible
	}

	private updatePixelColors() {
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(this.fileStateService.getFileStates())
		this.setPixel("selected", this.storeService.getState().appSettings.mapColors.selected)

		if (this._viewModel.isDeltaState) {
			this.updateDeltaColors()
		} else {
			this.updateNormalColors()
		}
	}

	private updateNormalColors() {
		const mapColors = this.storeService.getState().appSettings.mapColors
		const positive = this.storeService.getState().appSettings.whiteColorBuildings ? mapColors.lightGrey : mapColors.positive

		this.setPixel("positive", positive)
		this.setPixel("neutral", mapColors.neutral)
		this.setPixel("negative", mapColors.negative)
		this.setPixel("incomingEdge", mapColors.incomingEdge)
		this.setPixel("outgoingEdge", mapColors.outgoingEdge)
	}

	private updateDeltaColors() {
		const mapColors = this.storeService.getState().appSettings.mapColors
		const positiveDelta = this.storeService.getState().appSettings.invertDeltaColors ? mapColors.negativeDelta : mapColors.positiveDelta
		const negativeDelta = this.storeService.getState().appSettings.invertDeltaColors ? mapColors.positiveDelta : mapColors.negativeDelta

		this.setPixel("positiveDelta", positiveDelta)
		this.setPixel("negativeDelta", negativeDelta)
	}

	private setPixel(id: string, color: string) {
		$("#" + id).attr("src", ColorConverter.getImageDataUri(color))
	}

	private setMarkedPackageLists(markedPackages: MarkedPackage[]) {
		if (markedPackages) {
			this._viewModel.packageLists = []
			markedPackages.forEach(mp => this.handleMarkedPackage(mp))
		}
	}

	private handleMarkedPackage(mp: MarkedPackage) {
		const colorPixel = ColorConverter.getImageDataUri(mp.color)

		if (!mp.attributes["name"]) {
			mp.attributes["name"] = this.getPackagePathPreview(mp)
		}

		if (this.isColorPixelInPackageLists(colorPixel)) {
			this.insertMPIntoPackageList(mp, colorPixel)
		} else {
			const packageList: PackageList = { colorPixel: colorPixel, markedPackages: [mp] }
			this.addNewPackageList(packageList)
		}
	}

	private addNewPackageList(packageList: PackageList) {
		this._viewModel.packageLists.push(packageList)
	}

	private insertMPIntoPackageList(mp: MarkedPackage, colorPixel: string) {
		this._viewModel.packageLists.filter(packageList => packageList.colorPixel == colorPixel)[0].markedPackages.push(mp)
	}

	private isColorPixelInPackageLists(colorPixel: string) {
		return this._viewModel.packageLists.filter(mpList => mpList.colorPixel == colorPixel).length > 0
	}

	private getPackagePathPreview(mp: MarkedPackage): string {
		const MAX_NAME_LENGTH = { lowerLimit: 24, upperLimit: 28 }
		const packageName = this.getPackageNameFromPath(mp.path)

		if (packageName.length > MAX_NAME_LENGTH.lowerLimit && packageName.length < MAX_NAME_LENGTH.upperLimit) {
			return ".../" + packageName
		} else if (packageName.length > MAX_NAME_LENGTH.upperLimit) {
			const firstPart = packageName.substr(0, MAX_NAME_LENGTH.lowerLimit / 2)
			const secondPart = packageName.substr(packageName.length - MAX_NAME_LENGTH.lowerLimit / 2)
			return firstPart + "..." + secondPart
		} else {
			const from = Math.max(mp.path.length - MAX_NAME_LENGTH.lowerLimit, 0)
			const previewPackagePath = mp.path.substring(from)
			const startingDots = previewPackagePath.startsWith(CodeChartaService.ROOT_PATH) ? "" : "..."
			return startingDots + previewPackagePath
		}
	}

	private getPackageNameFromPath(path: string): string {
		const pathArray = path.split("/")
		return pathArray[pathArray.length - 1]
	}
}

export const legendPanelComponent = {
	selector: "legendPanelComponent",
	template: require("./legendPanel.component.html"),
	controller: LegendPanelController
}
