import { Inject, Injectable } from "@angular/core"
import { asyncScheduler, combineLatest, filter, tap, throttleTime } from "rxjs"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRendererService"
import { isActionOfType } from "../../../util/reduxHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { AmountOfEdgePreviewsActions } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { AmountOfTopLabelsActions } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { ColorLabelsActions } from "../../store/appSettings/colorLabels/colorLabels.actions"
import { EdgeHeightActions } from "../../store/appSettings/edgeHeight/edgeHeight.actions"
import { HideFlatBuildingsActions } from "../../store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { InvertAreaActions } from "../../store/appSettings/invertArea/invertArea.actions"
import { InvertHeightActions } from "../../store/appSettings/invertHeight/invertHeight.actions"
import { IsWhiteBackgroundActions } from "../../store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { LayoutAlgorithmActions } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { MapColorsActions } from "../../store/appSettings/mapColors/mapColors.actions"
import { MaxTreeMapFilesActions } from "../../store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { ScalingActions } from "../../store/appSettings/scaling/scaling.actions"
import { SharpnessModeActions } from "../../store/appSettings/sharpnessMode/sharpnessMode.actions"
import { ShowMetricLabelNameValueActions } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { ShowMetricLabelNodeNameActions } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { AreaMetricActions } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { ColorMetricActions } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { ColorModeActions } from "../../store/dynamicSettings/colorMode/colorMode.actions"
import { ColorRangeActions } from "../../store/dynamicSettings/colorRange/colorRange.actions"
import { EdgeMetricActions } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { FocusedNodePathActions } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { HeightMetricActions } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { MarginActions } from "../../store/dynamicSettings/margin/margin.actions"
import { SearchPatternActions } from "../../store/dynamicSettings/searchPattern/searchPattern.actions"

@Injectable()
export class RenderCodeMapEffect {
	constructor(@Inject(Store) private store: Store, @Inject(ActionsToken) private actions$: Actions) {}

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
				isActionOfType(action.type, EdgeHeightActions) || // todo check this and the next 2
				isActionOfType(action.type, AmountOfEdgePreviewsActions) ||
				isActionOfType(action.type, AmountOfTopLabelsActions) ||
				isActionOfType(action.type, LayoutAlgorithmActions) ||
				isActionOfType(action.type, MaxTreeMapFilesActions) ||
				isActionOfType(action.type, SharpnessModeActions) ||
				isActionOfType(action.type, ColorModeActions) ||
				isActionOfType(action.type, EdgeMetricActions) || // todo check
				isActionOfType(action.type, ColorRangeActions) ||
				isActionOfType(action.type, MarginActions) ||
				isActionOfType(action.type, SearchPatternActions) ||
				isActionOfType(action.type, FocusedNodePathActions) ||
				isActionOfType(action.type, HeightMetricActions) ||
				isActionOfType(action.type, AreaMetricActions) ||
				isActionOfType(action.type, ColorMetricActions) ||
				false
		)
	)

	renderCodeMap$ = createEffect(
		() =>
			combineLatest([this.store.select(accumulatedDataSelector), this.actionsRequiringRender$]).pipe(
				filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
				throttleTime(1000 / 60, asyncScheduler, { leading: true, trailing: true }),
				tap(([accumulatedData, action]) => {
					setTimeout(() => {
						// don't inject those AngularJS services, as AngularJS is not yet bootstrapped, when Effects are bootstrapped
						CodeMapRenderService.instance.render(accumulatedData.unifiedMapNode)
						ThreeRendererService.instance.render()
						if (isActionOfType(action.type, ScalingActions)) {
							CodeMapRenderService.instance.scaleMap()
						}
					})
				})
			),
		{ dispatch: false }
	)
}
