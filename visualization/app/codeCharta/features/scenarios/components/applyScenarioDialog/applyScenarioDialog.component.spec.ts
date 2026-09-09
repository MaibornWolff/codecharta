import { TestBed } from "@angular/core/testing"
import { ColorMode, MetricData } from "../../../../model/codeCharta.model"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { Scenario } from "../../model/scenario.model"
import { ScenarioSettingKey, ScenarioSettings } from "../../model/scenarioSettings.registry"
import { ScenarioApplierService } from "../../services/scenarioApplier.service"
import { ApplyScenarioDialogComponent } from "./applyScenarioDialog.component"

const testSettings: ScenarioSettings = {
    areaMetric: "rloc",
    margin: 30,
    heightMetric: "mcc",
    colorMetric: "mcc",
    colorRange: { from: 1, to: 10 },
    colorMode: ColorMode.weightedGradient,
    mapColors: defaultState.mapState.mapColors,
    camera: { position: { x: 0, y: 300, z: 1000 }, target: { x: 0, y: 0, z: 0 } },
    blacklist: []
}

const createTestScenario = (settings: ScenarioSettings = testSettings): Scenario => ({
    id: "test-id",
    name: "Test Scenario",
    createdAt: Date.now(),
    settings
})

const metricDataWithMetrics: MetricData = {
    nodeMetricData: [
        { name: "rloc", maxValue: 100, minValue: 0, values: [] },
        { name: "mcc", maxValue: 50, minValue: 0, values: [] }
    ],
    edgeMetricData: []
}

describe("ApplyScenarioDialogComponent", () => {
    let component: ApplyScenarioDialogComponent
    let scenarioApplier: Pick<ScenarioApplierService, "getMissingMetrics" | "hasMissingMetrics" | "getAvailableMetricNames"> & {
        applyScenario: jest.Mock
    }

    function createComponent(scenario: Scenario, metricData: MetricData = metricDataWithMetrics) {
        const fixture = TestBed.createComponent(ApplyScenarioDialogComponent)
        fixture.componentRef.setInput("scenario", scenario)
        fixture.componentRef.setInput("metricData", metricData)
        fixture.detectChanges()
        return fixture.componentInstance
    }

    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()

        const realApplier = Object.create(ScenarioApplierService.prototype) as ScenarioApplierService
        scenarioApplier = {
            applyScenario: jest.fn(),
            getMissingMetrics: realApplier.getMissingMetrics.bind(realApplier),
            hasMissingMetrics: realApplier.hasMissingMetrics.bind(realApplier),
            getAvailableMetricNames: realApplier.getAvailableMetricNames.bind(realApplier)
        }

        TestBed.configureTestingModule({
            imports: [ApplyScenarioDialogComponent],
            providers: [{ provide: ScenarioApplierService, useValue: scenarioApplier }]
        })

        component = createComponent(createTestScenario())
    })

    it("should offer every setting the scenario carries, all but the camera selected", () => {
        // Assert
        expect(component.availableKeys()).toEqual([
            "areaMetric",
            "margin",
            "heightMetric",
            "colorMetric",
            "colorRange",
            "colorMode",
            "mapColors",
            "camera",
            "blacklist"
        ])
        expect(component.selectedKeys()).toEqual(new Set(component.availableKeys().filter(key => key !== "camera")))
        expect(component.hasAnySelected()).toBe(true)
    })

    it("should detect no missing metrics when all are available", () => {
        // Assert
        expect(component.hasMissing()).toBe(false)
    })

    it("should detect missing metrics", () => {
        // Act
        const withoutMetrics = createComponent(createTestScenario(), { nodeMetricData: [], edgeMetricData: [] })

        // Assert
        expect(withoutMetrics.hasMissing()).toBe(true)
        expect(withoutMetrics.missingMetrics().nodeMetrics).toEqual(["rloc", "mcc"])
    })

    it("should not warn about a missing metric the reader has unchecked", () => {
        // Arrange
        const withoutMetrics = createComponent(createTestScenario(), { nodeMetricData: [], edgeMetricData: [] })

        // Act
        withoutMetrics.selectedKeys.set(new Set<ScenarioSettingKey>(["margin"]))

        // Assert
        expect(withoutMetrics.hasMissing()).toBe(false)
    })

    it("should apply only the selected settings", async () => {
        // Arrange
        component.selectedKeys.set(new Set<ScenarioSettingKey>(["margin", "colorRange"]))

        // Act
        await component.apply()

        // Assert
        expect(scenarioApplier.applyScenario).toHaveBeenCalledWith(
            component.scenario(),
            new Set<ScenarioSettingKey>(["margin", "colorRange"]),
            metricDataWithMetrics
        )
    })

    it("should report nothing selected when every setting is deselected", () => {
        // Act
        component.selectedKeys.set(new Set<ScenarioSettingKey>())

        // Assert
        expect(component.hasAnySelected()).toBe(false)
    })

    describe("partial (built-in) scenario", () => {
        let partialComponent: ApplyScenarioDialogComponent

        beforeEach(() => {
            partialComponent = createComponent({
                id: "built-in-rloc",
                name: "RLOC",
                createdAt: 0,
                isBuiltIn: true,
                settings: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc", colorRange: { from: 250, to: 500 } }
            })
        })

        it("should only offer the settings the scenario carries", () => {
            // Assert
            expect(partialComponent.availableKeys()).toEqual(["areaMetric", "heightMetric", "colorMetric", "colorRange"])
        })

        it("should not report missing metrics for settings the scenario does not carry", () => {
            // Assert
            expect(partialComponent.hasMissing()).toBe(false)
        })

        it("should apply the settings it carries", async () => {
            // Act
            await partialComponent.apply()

            // Assert
            expect(scenarioApplier.applyScenario).toHaveBeenCalledWith(
                partialComponent.scenario(),
                new Set<ScenarioSettingKey>(["areaMetric", "heightMetric", "colorMetric", "colorRange"]),
                metricDataWithMetrics
            )
        })
    })
})
