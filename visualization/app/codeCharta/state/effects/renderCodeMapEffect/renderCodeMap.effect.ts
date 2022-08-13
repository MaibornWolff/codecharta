import { Inject, Injectable } from "@angular/core"
import { asyncScheduler, combineLatest, concatMap, filter, skip, take, tap, throttleTime } from "rxjs"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeOrbitControlsService } from "../../../ui/codeMap/threeViewer/threeOrbitControlsService"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRendererService"
import { UploadFilesService } from "../../../ui/toolBar/uploadFilesButton/uploadFiles.service"
import { isActionOfType } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { State } from "../../angular-redux/state"
import { Store } from "../../angular-redux/store"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { AmountOfEdgePreviewsActions } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { AmountOfTopLabelsActions } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { ColorLabelsActions } from "../../store/appSettings/colorLabels/colorLabels.actions"
import { EdgeHeightActions } from "../../store/appSettings/edgeHeight/edgeHeight.actions"
import { HideFlatBuildingsActions } from "../../store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { InvertAreaActions } from "../../store/appSettings/invertArea/invertArea.actions"
import { InvertHeightActions } from "../../store/appSettings/invertHeight/invertHeight.actions"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"
import { IsWhiteBackgroundActions } from "../../store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { LayoutAlgorithmActions } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { MapColorsActions } from "../../store/appSettings/mapColors/mapColors.actions"
import { MaxTreeMapFilesActions } from "../../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { ScalingActions } from "../../store/appSettings/scaling/scaling.actions"
import { SharpnessModeActions } from "../../store/appSettings/sharpnessMode/sharpnessMode.actions"
import { ShowMetricLabelNameValueActions } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { ShowMetricLabelNodeNameActions } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { ShowOnlyBuildingsWithEdgesActions } from "../../store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { AreaMetricActions } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { ColorMetricActions } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { ColorModeActions } from "../../store/dynamicSettings/colorMode/colorMode.actions"
import { ColorRangeActions } from "../../store/dynamicSettings/colorRange/colorRange.actions"
import { EdgeMetricActions } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { FocusedNodePathActions } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { HeightMetricActions } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { MarginActions } from "../../store/dynamicSettings/margin/margin.actions"
import { SearchPatternActions } from "../../store/dynamicSettings/searchPattern/searchPattern.actions"

const maxFPS = 1000 / 60

// don't inject those AngularJS services, as AngularJS is not yet bootstrapped, when Effects are bootstrapped
@Injectable()
export class RenderCodeMapEffect {
	constructor(
		@Inject(Store) private store: Store,
		@Inject(ActionsToken) private actions$: Actions,
		@Inject(State) private state: State,
		@Inject(UploadFilesService) private uploadFilesService: UploadFilesService
	) {}

	private actionsRequiringRender$ = this.actions$.pipe(
		filter(
			action =>
				isActionOfType(action.type, ColorLabelsActions) ||
				isActionOfType(action.type, MapColorsActions) ||
				isActionOfType(action.type, ShowMetricLabelNodeNameActions) ||
				isActionOfType(action.type, ShowMetricLabelNameValueActions) ||
				isActionOfType(action.type, IsWhiteBackgroundActions) ||
				isActionOfType(action.type, InvertAreaActions) ||
				isActionOfType(action.type, InvertHeightActions) ||
				isActionOfType(action.type, HideFlatBuildingsActions) ||
				isActionOfType(action.type, ScalingActions) ||
				isActionOfType(action.type, EdgeHeightActions) ||
				isActionOfType(action.type, AmountOfEdgePreviewsActions) ||
				isActionOfType(action.type, AmountOfTopLabelsActions) ||
				isActionOfType(action.type, LayoutAlgorithmActions) ||
				isActionOfType(action.type, MaxTreeMapFilesActions) ||
				isActionOfType(action.type, SharpnessModeActions) ||
				isActionOfType(action.type, ColorModeActions) ||
				isActionOfType(action.type, EdgeMetricActions) ||
				isActionOfType(action.type, ColorRangeActions) ||
				isActionOfType(action.type, MarginActions) ||
				isActionOfType(action.type, SearchPatternActions) ||
				isActionOfType(action.type, FocusedNodePathActions) ||
				isActionOfType(action.type, HeightMetricActions) ||
				isActionOfType(action.type, AreaMetricActions) ||
				isActionOfType(action.type, ColorMetricActions) ||
				isActionOfType(action.type, ShowOnlyBuildingsWithEdgesActions) ||
				false
		)
	)

	renderCodeMap$ = createEffect(
		() =>
			combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
				filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
				throttleTime(maxFPS, asyncScheduler, { leading: false, trailing: true }),
				tap(([accumulatedData, action]) => {
					if (!isActionOfType(action.type, EdgeHeightActions)) {
						CodeMapRenderService.instance.render(accumulatedData.unifiedMapNode)
					}
					ThreeRendererService.instance.render()
					if (isActionOfType(action.type, ScalingActions)) {
						CodeMapRenderService.instance.scaleMap()
					}
				})
			),
		{ dispatch: false }
	)
	// Todo extract into own effect
	removeLoadingIndicator$ = createEffect(
		() =>
			this.renderCodeMap$.pipe(
				filter(() => !this.uploadFilesService.isUploading),
				tap(() => {
					this.store.dispatch(setIsLoadingFile(false))
					this.store.dispatch(setIsLoadingMap(false))
				})
			),
		{ dispatch: false }
	)

	autoFitCodeMapOnFileSelectionChange$ = createEffect(
		() =>
			this.store.select(visibleFileStatesSelector).pipe(
				skip(1), // initial map load is already fitted
				filter(() => resetCameraIfNewFileIsLoadedSelector(this.state.getValue())),
				concatMap(() => this.renderCodeMap$.pipe(take(1))),
				tap(() => {
					ThreeOrbitControlsService.instance?.autoFitTo()
				})
			),
		{ dispatch: false }
	)
}
