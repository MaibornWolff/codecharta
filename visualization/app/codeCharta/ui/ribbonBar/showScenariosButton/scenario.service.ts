import { Injectable } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { State, Store } from "@ngrx/store"
import { first } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { getNumberOfTopLabels } from "../../../state/effects/updateVisibleTopLabels/getNumberOfTopLabels"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { selectedColorMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setAmountOfEdgePreviews } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { defaultAmountOfEdgesPreviews } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setEdgeHeight } from "../../../state/store/appSettings/edgeHeight/edgeHeight.actions"
import { defaultEdgeHeight } from "../../../state/store/appSettings/edgeHeight/edgeHeight.reducer"
import { setMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.reducer"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { defaultScaling } from "../../../state/store/appSettings/scaling/scaling.reducer"
import { calculateInitialColorRange } from "../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setMargin } from "../../../state/store/dynamicSettings/margin/margin.actions"
import { defaultMargin } from "../../../state/store/dynamicSettings/margin/margin.reducer"
import { setState } from "../../../state/store/state.actions"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { ErrorDialogComponent } from "../../dialogs/errorDialog/errorDialog.component"
import { ScenarioHelper } from "./scenarioHelper"
import { setCameraZoomFactor } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.actions"

@Injectable()
export class ScenarioService {
    constructor(
        private state: State<CcState>,
        private store: Store<CcState>,
        private dialog: MatDialog,
        private threeCameraService: ThreeCameraService,
        private threeOrbitControlsService: ThreeOrbitControlsService
    ) {}

    getScenarios() {
        return ScenarioHelper.getScenarioItems(metricDataSelector(this.state.getValue()))
    }

    applyScenario(name: string) {
        const scenario = ScenarioHelper.scenarios.get(name)
        const scenarioSettings = ScenarioHelper.getScenarioSettings(scenario)
        this.store.dispatch(setState({ value: scenarioSettings }))

        if (!scenarioSettings.appSettings.amountOfTopLabels) {
            this.store
                .select(codeMapNodesSelector)
                .pipe(first())
                .subscribe(codeMapNodes => {
                    const amountOfTopLabels = getNumberOfTopLabels(codeMapNodes)
                    this.store.dispatch(setAmountOfTopLabels({ value: amountOfTopLabels }))
                })
        }
        if (!scenarioSettings.appSettings.mapColors) {
            this.store.dispatch(setMapColors({ value: defaultMapColors }))
        }
        if (!scenarioSettings.appSettings.edgeHeight) {
            this.store.dispatch(setEdgeHeight({ value: defaultEdgeHeight }))
        }
        if (!scenarioSettings.appSettings.amountOfEdgePreviews) {
            this.store.dispatch(setAmountOfEdgePreviews({ value: defaultAmountOfEdgesPreviews }))
        }
        if (!scenarioSettings.appSettings.scaling) {
            this.store.dispatch(setScaling({ value: defaultScaling }))
        }
        if (!scenarioSettings.dynamicSettings.colorRange) {
            this.store
                .select(selectedColorMetricDataSelector)
                .pipe(first())
                .subscribe(selectedColorMetricData => {
                    this.store.dispatch(setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
                })
        }
        if (!scenarioSettings.dynamicSettings.margin) {
            this.store.dispatch(setMargin({ value: defaultMargin }))
        }
        if (!scenarioSettings.dynamicSettings.edgeMetric) {
            this.store
                .select(metricDataSelector)
                .pipe(first())
                .subscribe(metricData => {
                    this.store.dispatch(setEdgeMetric({ value: metricData.edgeMetricData[0]?.name }))
                })
        }

        if (scenario.camera) {
            // @ts-ignore -- we know that it is not a partial when it is set
            this.threeCameraService.setPosition(scenario.camera.camera)
            this.store.dispatch(setCameraZoomFactor({ value: scenario.camera.zoom }))
            // @ts-ignore -- we know that it is not a partial when it is set
            this.threeOrbitControlsService.setControlTarget(scenario.camera.cameraTarget)
        }
    }

    removeScenario(name) {
        if (name !== "Complexity") {
            ScenarioHelper.deleteScenario(name)
            this.dialog.open(ErrorDialogComponent, {
                data: {
                    title: "Info",
                    message: `${name} deleted.`
                }
            })
        } else {
            this.dialog.open(ErrorDialogComponent, {
                data: {
                    title: "Error",
                    message: `${name} cannot be deleted as it is the default Scenario.`
                }
            })
        }
    }
}
