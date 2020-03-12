import angular from "angular"
// Plop: Append module import here
import { CameraTargetService } from "./store/appSettings/cameraTarget/cameraTarget.service"
import { SearchPanelModeService } from "./store/appSettings/searchPanelMode/searchPanelMode.service"
import { IsLoadingFileService } from "./store/appSettings/isLoadingFile/isLoadingFile.service"
import { IsLoadingMapService } from "./store/appSettings/isLoadingMap/isLoadingMap.service"
import { FilesService } from "./store/files/files.service"
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
import { InjectorService } from "./injector.service"
import { StoreService } from "./store.service"
import { EdgeMetricDataService } from "./edgeMetricData.service"
import { NodeSearchService } from "./nodeSearch.service"
import { MetricService } from "./metric.service"
import "../codeCharta.module"
import _ from "lodash"
import { IsPresentationModeService } from "./store/appSettings/isPresentationMode/isPresentationMode.service"

angular
	.module("app.codeCharta.state", ["app.codeCharta"])
	// Plop: Append service name here
	.service(_.camelCase(CameraTargetService.name), CameraTargetService)
	.service(_.camelCase(SearchPanelModeService.name), SearchPanelModeService)
	.service(_.camelCase(IsLoadingFileService.name), IsLoadingFileService)
	.service(_.camelCase(IsLoadingMapService.name), IsLoadingMapService)
	.service(_.camelCase(FilesService.name), FilesService)
	.service(_.camelCase(MapSizeService.name), MapSizeService)
	.service(_.camelCase(MapColorsService.name), MapColorsService)
	.service(_.camelCase(ResetCameraIfNewFileIsLoadedService.name), ResetCameraIfNewFileIsLoadedService)
	.service(_.camelCase(ShowOnlyBuildingsWithEdgesService.name), ShowOnlyBuildingsWithEdgesService)
	.service(_.camelCase(WhiteColorBuildingsService.name), WhiteColorBuildingsService)
	.service(_.camelCase(IsWhiteBackgroundService.name), IsWhiteBackgroundService)
	.service(_.camelCase(DynamicMarginService.name), DynamicMarginService)
	.service(_.camelCase(InvertHeightService.name), InvertHeightService)
	.service(_.camelCase(InvertDeltaColorsService.name), InvertDeltaColorsService)
	.service(_.camelCase(InvertColorRangeService.name), InvertColorRangeService)
	.service(_.camelCase(HideFlatBuildingsService.name), HideFlatBuildingsService)
	.service(_.camelCase(CameraService.name), CameraService)
	.service(_.camelCase(ScalingService.name), ScalingService)
	.service(_.camelCase(EdgeHeightService.name), EdgeHeightService)
	.service(_.camelCase(AmountOfEdgePreviewsService.name), AmountOfEdgePreviewsService)
	.service(_.camelCase(AmountOfTopLabelsService.name), AmountOfTopLabelsService)
	.service(_.camelCase(MarkedPackagesService.name), MarkedPackagesService)
	.service(_.camelCase(EdgesService.name), EdgesService)
	.service(_.camelCase(AttributeTypesService.name), AttributeTypesService)
	.service(_.camelCase(EdgeMetricService.name), EdgeMetricService)
	.service(_.camelCase(ColorRangeService.name), ColorRangeService)
	.service(_.camelCase(MarginService.name), MarginService)
	.service(_.camelCase(SearchPatternService.name), SearchPatternService)
	.service(_.camelCase(SearchedNodePathsService.name), SearchedNodePathsService)
	.service(_.camelCase(FocusedNodePathService.name), FocusedNodePathService)
	.service(_.camelCase(HeightMetricService.name), HeightMetricService)
	.service(_.camelCase(DistributionMetricService.name), DistributionMetricService)
	.service(_.camelCase(ColorMetricService.name), ColorMetricService)
	.service(_.camelCase(AreaMetricService.name), AreaMetricService)
	.service(_.camelCase(IsPresentationModeService.name), IsPresentationModeService)
	.service(_.camelCase(BlacklistService.name), BlacklistService)
	.service(_.camelCase(InjectorService.name), InjectorService)
	.service(_.camelCase(StoreService.name), StoreService)
	.service(_.camelCase(EdgeMetricDataService.name), EdgeMetricDataService)
	.service(_.camelCase(NodeSearchService.name), NodeSearchService)
	.service(_.camelCase(MetricService.name), MetricService)
