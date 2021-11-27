import "./attributeSideBar.component.scss"
import { IRootScopeService } from "angular"
import { Node } from "../../codeCharta.model"
import {
	IsAttributeSideBarVisibleService,
	IsAttributeSideBarVisibleSubscriber
} from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { StoreService } from "../../state/store.service"
import { closeAttributeSideBar } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"

export interface PrimaryMetrics {
	node: {
		area: string
		color: string
		height: string
	}
	edge: {
		edge: string
	}
}

export interface SecondaryMetric {
	name: string
	type: string
}

export class AttributeSideBarController implements IsAttributeSideBarVisibleSubscriber {
	private _viewModel: {
		node: Node
		fileName: string
		isSideBarVisible: boolean
	} = {
		node: null,
		fileName: null,
		isSideBarVisible: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		"ngInject"
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	onClickCloseSideBar = () => {
		this.storeService.dispatch(closeAttributeSideBar())
	}

	onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this._viewModel.node = selectedBuilding.node
		this._viewModel.fileName = this.codeMapPreRenderService.getRenderFileMeta().fileName
	}
}

export const attributeSideBarComponent = {
	selector: "attributeSideBarComponent",
	template: require("./attributeSideBar.component.html"),
	controller: AttributeSideBarController
}
