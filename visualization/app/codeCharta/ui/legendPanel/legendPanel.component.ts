import { IRootScopeService } from 'angular'
import './legendPanel.component.scss'
import { ColorRange } from '../../codeCharta.model'
import { ColorRangeService, ColorRangeSubscriber } from '../../state/store/dynamicSettings/colorRange/colorRange.service'
import {
	IsAttributeSideBarVisibleService,
	IsAttributeSideBarVisibleSubscriber
} from '../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service'
import { isDeltaState } from '../../model/files/files.helper'
import { ColorMetricService, ColorMetricSubscriber } from '../../state/store/dynamicSettings/colorMetric/colorMetric.service'
import { FilesSelectionSubscriber, FilesService } from '../../state/store/files/files.service'
import { FileState } from '../../model/files/files'

export class LegendPanelController
	implements IsAttributeSideBarVisibleSubscriber, ColorMetricSubscriber, ColorRangeSubscriber, FilesSelectionSubscriber {
	private _viewModel: {
		isLegendVisible: boolean
		isSideBarVisible: boolean
		isDeltaState: boolean
		colorMetric: string
		colorRange: ColorRange
	} = {
		isLegendVisible: false,
		isSideBarVisible: null,
		isDeltaState: null,
		colorMetric: null,
		colorRange: null
	}

	constructor(private $rootScope: IRootScopeService) {
		ColorMetricService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
	}

	onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetric = colorMetric
	}

	onColorRangeChanged(colorRange: ColorRange) {
		this._viewModel.colorRange = colorRange
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	toggle() {
		this._viewModel.isLegendVisible = !this._viewModel.isLegendVisible
	}
}

export const legendPanelComponent = {
	selector: 'legendPanelComponent',
	template: require('./legendPanel.component.html'),
	controller: LegendPanelController
}
