import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Store, StoreModule } from "@ngrx/store"
import { Vector3 } from "three"
import { CcState, ColorMode } from "../../../model/codeCharta.model"
import { ThreeCameraService, ThreeMapControlsService, ThreeRendererService } from "../../../renderer/threeViewer/threeViewer.facade"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { LinkColorMetricToHeightMetricEffect } from "../../metricsBar/effects/linkColorMetricToHeightMetric/linkColorMetricToHeightMetric.effect"
import { ResetColorRangeEffect } from "../../metricsBar/effects/resetColorRange/resetColorRange.effect"
import { Scenario } from "../model/scenario.model"
import { ScenarioSettingKey, ScenarioSettings } from "../model/scenarioSettings.registry"
import { ScenarioApplierService } from "./scenarioApplier.service"

const linkedScenario: Scenario = {
    id: "built-in-complexity",
    name: "Complexity",
    createdAt: 0,
    isBuiltIn: true,
    settings: {
        areaMetric: "rloc",
        heightMetric: "complexity",
        colorMetric: "complexity",
        isColorMetricLinkedToHeightMetric: true,
        colorRange: { from: 50, to: 100 },
        colorMode: ColorMode.weightedGradient
    }
}

const selectedKeysOf = (settings: ScenarioSettings) => new Set(Object.keys(settings) as ScenarioSettingKey[])

/**
 * The applier runs against the real reducers and the two metrics-bar effects that derive state from a
 * metric change, because the order it dispatches in only matters once those effects run.
 */
describe("ScenarioApplierService with the metrics-bar effects", () => {
    let service: ScenarioApplierService
    let store: Store<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([LinkColorMetricToHeightMetricEffect, ResetColorRangeEffect])
            ],
            providers: [
                {
                    provide: ThreeCameraService,
                    useValue: { camera: { position: new Vector3(), lookAt: jest.fn(), updateProjectionMatrix: jest.fn() } }
                },
                {
                    provide: ThreeMapControlsService,
                    useValue: { controls: { target: new Vector3() }, setControlTarget: jest.fn(), updateControls: jest.fn() }
                },
                { provide: ThreeRendererService, useValue: { render: jest.fn() } }
            ]
        })

        store = TestBed.inject(Store)
        service = TestBed.inject(ScenarioApplierService)
    })

    function readState(): CcState {
        let state: CcState
        store
            .subscribe(value => {
                state = value
            })
            .unsubscribe()
        return state
    }

    it("should keep the color range of a scenario that links the color metric to the height metric", async () => {
        // Arrange — linking is off, as it is in a fresh session
        expect(readState().preferences.isColorMetricLinkedToHeightMetric).toBe(false)

        // Act
        await service.applyScenario(linkedScenario, selectedKeysOf(linkedScenario.settings))

        // Assert — switching the link on re-derives the color range, so it must happen before the range is written
        expect(readState().mapState.colorRange).toEqual({ from: 50, to: 100 })
        expect(readState().mapState.colorMetric).toBe("complexity")
    })

    it("should keep a color metric that differs from the height metric when the scenario unlinks them", async () => {
        // Arrange — linking is on, as it is after applying a built-in scenario
        store.dispatch({ type: "SET_STATE", value: { preferences: { isColorMetricLinkedToHeightMetric: true } } })
        const unlinkedScenario: Scenario = {
            id: "unlinked",
            name: "Unlinked",
            createdAt: 0,
            settings: { heightMetric: "mcc", colorMetric: "rloc", isColorMetricLinkedToHeightMetric: false }
        }

        // Act
        await service.applyScenario(unlinkedScenario, selectedKeysOf(unlinkedScenario.settings))

        // Assert
        expect(readState().mapState.heightMetric).toBe("mcc")
        expect(readState().mapState.colorMetric).toBe("rloc")
    })
})
