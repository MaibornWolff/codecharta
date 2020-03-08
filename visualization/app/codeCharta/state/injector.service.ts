// Plop: Append service import here
import { SearchPanelModeService } from "./store/appSettings/searchPanelMode/searchPanelMode.service"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { IsLoadingMapService } from "./store/appSettings/isLoadingMap/isLoadingMap.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { MapColorsService } from "./store/appSettings/mapColors/mapColors.service"
import { ResetCameraIfNewFileIsLoadedService } from "./store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.service"
import { ShowOnlyBuildingsWithEdgesService } from "./store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"
import { WhiteColorBuildingsService } from "./store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { IsWhiteBackgroundService } from "./store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { DynamicMarginService } from "./store/appSettings/dynamicMargin/dynamicMargin.service"
import { InvertHeightService } from "./store/appSettings/invertHeight/invertHeight.service"
import { InvertDeltaColorsService } from "./store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { InvertColorRangeService } from "./store/appSettings/invertColorRange/invertColorRange.service"
import { HideFlatBuildingsService } from "./store/appSettings/hideFlatBuildings/hideFlatBuildings.service"
import { CameraService } from "./store/appSettings/camera/camera.service"
import { ScalingService } from "./store/appSettings/scaling/scaling.service"
import { EdgeHeightService } from "./store/appSettings/edgeHeight/edgeHeight.service"
import { AmountOfEdgePreviewsService } from "./store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { AmountOfTopLabelsService } from "./store/appSettings/amountOfTopLabels/amountOfTopLabels.service"
import { MarkedPackagesService } from "./store/fileSettings/markedPackages/markedPackages.service"
import { EdgesService } from "./store/fileSettings/edges/edges.service"
import { AttributeTypesService } from "./store/fileSettings/attributeTypes/attributeTypes.service"
import { EdgeMetricService } from "./store/dynamicSettings/edgeMetric/edgeMetric.service"
import { ColorRangeService } from "./store/dynamicSettings/colorRange/colorRange.service"
import { MarginService } from "./store/dynamicSettings/margin/margin.service"
import { SearchPatternService } from "./store/dynamicSettings/searchPattern/searchPattern.service"
import { SearchedNodePathsService } from "./store/dynamicSettings/searchedNodePaths/searchedNodePaths.service"
import { FocusedNodePathService } from "./store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { HeightMetricService } from "./store/dynamicSettings/heightMetric/heightMetric.service"
import { DistributionMetricService } from "./store/dynamicSettings/distributionMetric/distributionMetric.service"
import { ColorMetricService } from "./store/dynamicSettings/colorMetric/colorMetric.service"
import { AreaMetricService } from "./store/dynamicSettings/areaMetric/areaMetric.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { NodeSearchService } from "./nodeSearch.service"
import { IsPresentationModeService } from "./store/appSettings/isPresentationMode/isPresentationMode.service"

export class InjectorService {
	/* @ngInject */
	constructor(
		// tslint:disable:no-unused-variable
		// We have to inject the services somewhere
		// Plop: Append service injection here
		private searchPanelModeService: SearchPanelModeService,
		private isLoadingFileService: IsLoadingFileService,
		private isLoadingMapService: IsLoadingMapService,
		private mapSizeService: MapSizeService,
		private mapColorsService: MapColorsService,
		private resetCameraIfNewFileIsLoadedService: ResetCameraIfNewFileIsLoadedService,
		private showOnlyBuildingsWithEdgesService: ShowOnlyBuildingsWithEdgesService,
		private whiteColorBuildingsService: WhiteColorBuildingsService,
		private isWhiteBackgroundService: IsWhiteBackgroundService,
		private dynamicMarginService: DynamicMarginService,
		private invertHeightService: InvertHeightService,
		private invertDeltaColorsService: InvertDeltaColorsService,
		private invertColorRangeService: InvertColorRangeService,
		private hideFlatBuildingsService: HideFlatBuildingsService,
		private cameraService: CameraService,
		private scalingService: ScalingService,
		private edgeHeightService: EdgeHeightService,
		private amountOfEdgePreviewsService: AmountOfEdgePreviewsService,
		private amountOfTopLabelsService: AmountOfTopLabelsService,
		private markedPackagesService: MarkedPackagesService,
		private edgesService: EdgesService,
		private attributeTypesService: AttributeTypesService,
		private edgeMetricService: EdgeMetricService,
		private colorRangeService: ColorRangeService,
		private marginService: MarginService,
		private searchPatternService: SearchPatternService,
		private searchedNodePathsService: SearchedNodePathsService,
		private focusedNodePathService: FocusedNodePathService,
		private heightMetricService: HeightMetricService,
		private distributionMetricService: DistributionMetricService,
		private colorMetricService: ColorMetricService,
		private areaMetricService: AreaMetricService,
		private blacklistService: BlacklistService,
		private nodeSearchService: NodeSearchService,
		private isPresentationModeService: IsPresentationModeService
	) {}
}
