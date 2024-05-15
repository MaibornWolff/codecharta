import { TestBed } from "@angular/core/testing"
import { MatDialog } from "@angular/material/dialog"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CcState } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { selectedColorMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setAmountOfEdgePreviews } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { defaultAmountOfEdgesPreviews } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.reducer"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.reducer"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { defaultScaling } from "../../../state/store/appSettings/scaling/scaling.reducer"
import { calculateInitialColorRange } from "../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { setColorRange } from "../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setState } from "../../../state/store/state.actions"
import { defaultState } from "../../../state/store/state.manager"
import { METRIC_DATA } from "../../../util/dataMocks"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { ErrorDialogComponent } from "../../dialogs/errorDialog/errorDialog.component"
import { ScenarioService } from "./scenario.service"
import { ScenarioHelper } from "./scenarioHelper"

describe("scenarioService", () => {
    let scenarioService: ScenarioService
    let mockedStore: MockStore<CcState>
    let mockedDialog: MatDialog
    let mockedThreeCameraService: ThreeCameraService
    let mockedThreeOrbitControlsService: ThreeOrbitControlsService
    const initialState: CcState = {
        fileSettings: undefined,
        dynamicSettings: undefined,
        appSettings: undefined,
        files: [],
        appStatus: undefined
    }
    const selectedColorMetricData = { minValue: 20, maxValue: 120, values: [20, 120] }
    const metricData = {
        nodeMetricData: METRIC_DATA,
        edgeMetricData: []
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ScenarioService,
                provideMockStore({
                    initialState,
                    selectors: [
                        {
                            selector: codeMapNodesSelector,
                            value: [
                                {
                                    name: "sample1.ts"
                                },
                                {
                                    name: "sample2.ts"
                                }
                            ]
                        },
                        { selector: selectedColorMetricDataSelector, value: selectedColorMetricData },
                        { selector: metricDataSelector, value: metricData }
                    ]
                }),
                { provide: MatDialog, useValue: { open: jest.fn() } },
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeCameraService, useValue: { setPosition: jest.fn() } },
                { provide: ThreeOrbitControlsService, useValue: { setControlTarget: jest.fn() } }
            ]
        })

        mockedStore = TestBed.inject(MockStore)
        mockedDialog = TestBed.inject(MatDialog)
        scenarioService = TestBed.inject(ScenarioService)
        mockedThreeCameraService = TestBed.inject(ThreeCameraService)
        mockedThreeOrbitControlsService = TestBed.inject(ThreeOrbitControlsService)

        ScenarioHelper.scenarios.set("Scenario1", {
            name: "Scenario1",
            area: { areaMetric: "rloc", margin: 50 },
            edge: { edgeHeight: 42 },
            camera: {
                camera: { x: 1, y: 1, z: 1 },
                cameraTarget: { x: 2, y: 2, z: 2 }
            }
        })
    })

    describe("apply scenario", () => {
        it("should apply a scenario", () => {
            const dispatchSpy = jest.spyOn(mockedStore, "dispatch")
            scenarioService.applyScenario("Scenario1")
            expect(dispatchSpy).toHaveBeenCalledWith(
                setState({
                    value: {
                        dynamicSettings: { areaMetric: "rloc", margin: 50 },
                        appSettings: { edgeHeight: 42 }
                    }
                })
            )
            expect(mockedThreeCameraService.setPosition).toHaveBeenCalledWith({ x: 1, y: 1, z: 1 })
            expect(mockedThreeOrbitControlsService.setControlTarget).toHaveBeenCalledWith({ x: 2, y: 2, z: 2 })
        })

        it("should set properties to default if not defined in scenario", () => {
            const dispatchSpy = jest.spyOn(mockedStore, "dispatch")
            scenarioService.applyScenario("Scenario1")
            expect(dispatchSpy).toHaveBeenCalledWith(setAmountOfTopLabels({ value: 1 }))
            expect(dispatchSpy).toHaveBeenCalledWith(setMapColors({ value: defaultMapColors }))
            expect(dispatchSpy).toHaveBeenCalledWith(setScaling({ value: defaultScaling }))
            expect(dispatchSpy).toHaveBeenCalledWith(setAmountOfEdgePreviews({ value: defaultAmountOfEdgesPreviews }))
            expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
            expect(dispatchSpy).toHaveBeenCalledWith(setEdgeMetric({ value: metricData.edgeMetricData[0]?.name }))
        })
    })

    describe("removeScenario", () => {
        beforeEach(() => {
            ScenarioHelper.deleteScenario = jest.fn()
        })

        it("should call deleteScenario", () => {
            scenarioService.removeScenario("Scenario1")
            expect(ScenarioHelper.deleteScenario).toHaveBeenCalledWith("Scenario1")
            expect(mockedDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
                data: {
                    title: "Info",
                    message: "Scenario1 deleted."
                }
            })
        })

        it("should not delete default 'Complexity' scenario", () => {
            scenarioService.removeScenario("Complexity")
            expect(ScenarioHelper.deleteScenario).not.toHaveBeenCalled()
            expect(mockedDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
                data: {
                    title: "Error",
                    message: "Complexity cannot be deleted as it is the default Scenario."
                }
            })
        })
    })
})
