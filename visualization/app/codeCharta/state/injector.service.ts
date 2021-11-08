//@ts-nocheck

// Plop: Append service import here
import { ColorModeService } from "./store/dynamicSettings/colorMode/colorMode.service"
import { SecondaryMetricsService } from "./store/appSettings/secondaryMetrics/secondaryMetrics.service"
import { RecentFilesService } from "./store/dynamicSettings/recentFiles/recentFiles.service"
import { ColorLabelsService } from "./store/appSettings/colorLabels/colorLabels.service"
import { LabelShowMetricValueService } from "./store/appSettings/showMetricLabelNodeName/labelShowMetricValueService"
import { LabelShowNodeNameService } from "./store/appSettings/showMetricLabelNameValue/labelShowNodeNameService"
import { PanelSelectionService } from "./store/appSettings/panelSelection/panelSelection.service"
import { EdgeMetricDataService } from "./store/metricData/edgeMetricData/edgeMetricData.service"
import { NodeMetricDataService } from "./store/metricData/nodeMetricData/nodeMetricData.service"
import { CameraTargetService } from "./store/appSettings/cameraTarget/cameraTarget.service"
import { IdToNodeService } from "./store/lookUp/idToNode/idToNode.service"
import { IdToBuildingService } from "./store/lookUp/idToBuilding/idToBuilding.service"
import { IsAttributeSideBarVisibleService } from "./store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { FilesService } from "./store/files/files.service"
import { SearchPanelModeService } from "./store/appSettings/searchPanelMode/searchPanelMode.service"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { IsLoadingMapService } from "./store/appSettings/isLoadingMap/isLoadingMap.service"
import { MapSizeService } from "./store/treeMap/mapSize/mapSize.service"
import { MapColorsService } from "./store/appSettings/mapColors/mapColors.service"
import { ResetCameraIfNewFileIsLoadedService } from "./store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.service"
import { ShowOnlyBuildingsWithEdgesService } from "./store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"
import { IsWhiteBackgroundService } from "./store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { DynamicMarginService } from "./store/appSettings/dynamicMargin/dynamicMargin.service"
import { InvertHeightService } from "./store/appSettings/invertHeight/invertHeight.service"
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
import { FocusedNodePathService } from "./store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { HeightMetricService } from "./store/dynamicSettings/heightMetric/heightMetric.service"
import { DistributionMetricService } from "./store/dynamicSettings/distributionMetric/distributionMetric.service"
import { ColorMetricService } from "./store/dynamicSettings/colorMetric/colorMetric.service"
import { AreaMetricService } from "./store/dynamicSettings/areaMetric/areaMetric.service"
import { BlacklistService } from "./store/fileSettings/blacklist/blacklist.service"
import { IsPresentationModeService } from "./store/appSettings/isPresentationMode/isPresentationMode.service"
import { MetricDataService } from "./store/metricData/metricData.service"
import { ExperimentalFeaturesEnabledService } from "./store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { LayoutAlgorithmService } from "./store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { MaxTreeMapFilesService } from "./store/appSettings/maxTreeMapFiles/maxTreeMapFiles.service"
import { SharpnessModeService } from "./store/appSettings/sharpnessMode/sharpnessMode.service"
import { ScreenshotToClipboardEnabledService } from "./store/appSettings/enableClipboard/screenshotToClipboardEnabled.service"
export class InjectorService {
	constructor(
		// We have to inject the services somewhere
		// Plop: Append service injection here
		private colorModeService: ColorModeService,
		private secondaryMetricsService: SecondaryMetricsService,
		private recentFilesService: RecentFilesService,
		private colorLabelsService: ColorLabelsService,
		private labelShowMetricValueService: LabelShowMetricValueService,
		private labelShowNodeNameService: LabelShowNodeNameService,
		private panelSelectionService: PanelSelectionService,
		private metricDataService: MetricDataService,
		private edgeMetricDataService: EdgeMetricDataService,
		private nodeMetricDataService: NodeMetricDataService,
		private cameraTargetService: CameraTargetService,
		private idToNodeService: IdToNodeService,
		private idToBuildingService: IdToBuildingService,
		private isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService,
		private searchPanelModeService: SearchPanelModeService,
		private isLoadingFileService: IsLoadingFileService,
		private isLoadingMapService: IsLoadingMapService,
		private filesService: FilesService,
		private mapSizeService: MapSizeService,
		private mapColorsService: MapColorsService,
		private resetCameraIfNewFileIsLoadedService: ResetCameraIfNewFileIsLoadedService,
		private showOnlyBuildingsWithEdgesService: ShowOnlyBuildingsWithEdgesService,
		private isWhiteBackgroundService: IsWhiteBackgroundService,
		private dynamicMarginService: DynamicMarginService,
		private invertHeightService: InvertHeightService,
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
		private focusedNodePathService: FocusedNodePathService,
		private heightMetricService: HeightMetricService,
		private distributionMetricService: DistributionMetricService,
		private colorMetricService: ColorMetricService,
		private areaMetricService: AreaMetricService,
		private blacklistService: BlacklistService,
		private isPresentationModeService: IsPresentationModeService,
		private layoutAlgorithmService: LayoutAlgorithmService,
		private maxTreeMapFilesService: MaxTreeMapFilesService,
		private sharpnessModeService: SharpnessModeService,
		private experimentalFeaturesEnabledService: ExperimentalFeaturesEnabledService,
		private screenshotToClipboardEnabledService: ScreenshotToClipboardEnabledService
	) {
		"ngInject"
	}
}
