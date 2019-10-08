import { SettingsService } from "../../state/settingsService/settings.service"
import $ from "jquery"
import { IRootScopeService } from "angular"
import "./legendPanel.component.scss"
import { ColorRange, MarkedPackage, RecursivePartial, Settings } from "../../codeCharta.model"
import { CodeChartaService } from "../../codeCharta.service"
import { FileStateService } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { ColorConverter } from "../../util/color/colorConverter"
import { SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"
import { AttributeSideBarService, AttributeSideBarVisibilitySubscriber } from "../attributeSideBar/attributeSideBar.service"

export interface PackageList {
	colorPixel: string
	markedPackages: MarkedPackage[]
}

export class LegendPanelController implements SettingsServiceSubscriber, AttributeSideBarVisibilitySubscriber {
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
	constructor(private $rootScope: IRootScopeService, private fileStateService: FileStateService) {
		SettingsService.subscribe(this.$rootScope, this)
		AttributeSideBarService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(s: Settings, update: RecursivePartial<Settings>) {
		this._viewModel.colorRange = s.dynamicSettings.colorRange
		this._viewModel.invertColorRange = s.appSettings.invertColorRange
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(this.fileStateService.getFileStates())

		const select = ColorConverter.getImageDataUri(s.appSettings.mapColors.selected)
		$("#select").attr("src", select)

		if (this._viewModel.isDeltaState) {
			this.refreshDeltaColors(s)
		} else {
			this.refreshNormalColors(s)
		}
		this.setMarkedPackageLists(s)
	}

	public onAttributeSideBarVisibilityChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	private refreshNormalColors(s: Settings) {
		const positive = ColorConverter.getImageDataUri(
			s.appSettings.whiteColorBuildings ? s.appSettings.mapColors.lightGrey : s.appSettings.mapColors.positive
		)
		const neutral = ColorConverter.getImageDataUri(s.appSettings.mapColors.neutral)
		const negative = ColorConverter.getImageDataUri(s.appSettings.mapColors.negative)
		const incomingEdge = ColorConverter.getImageDataUri(s.appSettings.mapColors.incomingEdge)
		const outgoingEdge = ColorConverter.getImageDataUri(s.appSettings.mapColors.outgoingEdge)
		$("#green").attr("src", positive)
		$("#yellow").attr("src", neutral)
		$("#red").attr("src", negative)
		$("#blue").attr("src", incomingEdge)
		$("#pink").attr("src", outgoingEdge)
	}

	private refreshDeltaColors(s: Settings) {
		const positiveDeltaPixel = ColorConverter.getImageDataUri(
			s.appSettings.invertDeltaColors ? s.appSettings.mapColors.negativeDelta : s.appSettings.mapColors.positiveDelta
		)
		const negativeDeltaPixel = ColorConverter.getImageDataUri(
			s.appSettings.invertDeltaColors ? s.appSettings.mapColors.positiveDelta : s.appSettings.mapColors.negativeDelta
		)
		$("#positiveDelta").attr("src", positiveDeltaPixel)
		$("#negativeDelta").attr("src", negativeDeltaPixel)
	}

	private setMarkedPackageLists(s: Settings) {
		const markedPackages: MarkedPackage[] = s.fileSettings.markedPackages
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

	public toggle() {
		this._viewModel.isLegendVisible = !this._viewModel.isLegendVisible
	}
}

export const legendPanelComponent = {
	selector: "legendPanelComponent",
	template: require("./legendPanel.component.html"),
	controller: LegendPanelController
}
