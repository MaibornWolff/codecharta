import { IRootScopeService } from "angular"
import "./legendPanel.component.scss"
import { ColorRange, MarkedPackage, MapColors } from "../../codeCharta.model"
import { ColorConverter } from "../../util/color/colorConverter"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import {
	InvertColorRangeService,
	InvertColorRangeSubscriber
} from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { StoreService } from "../../state/store.service"
import { MarkedPackagesSubscriber, MarkedPackagesService } from "../../state/store/fileSettings/markedPackages/markedPackages.service"
import {
	WhiteColorBuildingsService,
	WhiteColorBuildingsSubscriber
} from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import {
	InvertDeltaColorsSubscriber,
	InvertDeltaColorsService
} from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import {
	IsAttributeSideBarVisibleService,
	IsAttributeSideBarVisibleSubscriber
} from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { isDeltaState } from "../../model/files/files.helper"
import {
	ColorMetricService,
	ColorMetricSubscriber
} from "../../state/store/dynamicSettings/colorMetric/colorMetric.service";

export interface PackageList {
	colorPixel: string
	markedPackages: MarkedPackage[]
}

export class LegendPanelController
	implements
		IsAttributeSideBarVisibleSubscriber,
		ColorMetricSubscriber,
		ColorRangeSubscriber,
		InvertColorRangeSubscriber,
		MarkedPackagesSubscriber,
		WhiteColorBuildingsSubscriber,
		InvertDeltaColorsSubscriber {
	private _viewModel: {
		isLegendVisible: boolean
		isSideBarVisible: boolean
		isDeltaState: boolean
		colorMetric: string
		colorRange: ColorRange
		invertColorRange: boolean
		packageLists: PackageList[]
		colorIcons: Record<string, string>
	} = {
		isLegendVisible: false,
		isSideBarVisible: null,
		isDeltaState: null,
		colorMetric: null,
		colorRange: null,
		invertColorRange: null,
		packageLists: null,
		colorIcons: {}
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		ColorMetricService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		InvertColorRangeService.subscribe(this.$rootScope, this)
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
		MarkedPackagesService.subscribe(this.$rootScope, this)
		WhiteColorBuildingsService.subscribe(this.$rootScope, this)
		InvertDeltaColorsService.subscribe(this.$rootScope, this)
	}

	onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetric = colorMetric
	}

	onColorRangeChanged(colorRange: ColorRange) {
		this._viewModel.colorRange = colorRange
		this.updatePixelColors()
	}

	onInvertColorRangeChanged(invertColorRange: boolean) {
		this._viewModel.invertColorRange = invertColorRange
		this.updatePixelColors()
	}

	onInvertDeltaColorsChanged() {
		this.updatePixelColors()
	}

	onMarkedPackagesChanged(markedPackages: MarkedPackage[]) {
		this.setMarkedPackageLists(markedPackages)
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	onWhiteColorBuildingsChanged() {
		this.updatePixelColors()
	}

	toggle() {
		this._viewModel.isLegendVisible = !this._viewModel.isLegendVisible
	}

	private updatePixelColors() {
		this._viewModel.isDeltaState = isDeltaState(this.storeService.getState().files)

		const { mapColors } = this.storeService.getState().appSettings
		this._viewModel.colorIcons.selected = this.getImage(mapColors.selected)
		this._viewModel.colorIcons.incomingEdge = this.getImage(mapColors.incomingEdge)
		this._viewModel.colorIcons.outgoingEdge = this.getImage(mapColors.outgoingEdge)

		if (this._viewModel.isDeltaState) {
			this.updateDeltaColors(mapColors)
		} else {
			this.updateNormalColors(mapColors)
		}
	}

	private updateNormalColors(mapColors: MapColors) {
		const positive = this.storeService.getState().appSettings.whiteColorBuildings ? mapColors.lightGrey : mapColors.positive

		this._viewModel.colorIcons.positive = this.getImage(positive)
		this._viewModel.colorIcons.neutral = this.getImage(mapColors.neutral)
		this._viewModel.colorIcons.negative = this.getImage(mapColors.negative)
	}

	private updateDeltaColors(mapColors: MapColors) {
		this._viewModel.colorIcons.positiveDelta = this.getImage(mapColors.positiveDelta)
		this._viewModel.colorIcons.negativeDelta = this.getImage(mapColors.negativeDelta)
	}

	private getImage(color: string) {
		return ColorConverter.getImageDataUri(color)
	}

	private setMarkedPackageLists(markedPackages: MarkedPackage[]) {
		if (markedPackages) {
			this._viewModel.packageLists = []
			markedPackages.forEach(mp => this.handleMarkedPackage(mp))
		}
	}

	private handleMarkedPackage(mp: MarkedPackage) {
		const colorPixel = ColorConverter.getImageDataUri(mp.color)

		if (this.isColorPixelInPackageLists(colorPixel)) {
			this.insertMPIntoPackageList(mp, colorPixel)
		} else {
			const packageList: PackageList = { colorPixel, markedPackages: [mp] }
			this.addNewPackageList(packageList)
		}
	}

	private addNewPackageList(packageList: PackageList) {
		this._viewModel.packageLists.push(packageList)
	}

	private insertMPIntoPackageList(mp: MarkedPackage, colorPixel: string) {
		this._viewModel.packageLists.find(packageList => packageList.colorPixel === colorPixel).markedPackages.push(mp)
	}

	private isColorPixelInPackageLists(colorPixel: string) {
		return this._viewModel.packageLists.filter(mpList => mpList.colorPixel === colorPixel).length > 0
	}
}

export const legendPanelComponent = {
	selector: "legendPanelComponent",
	template: require("./legendPanel.component.html"),
	controller: LegendPanelController
}
