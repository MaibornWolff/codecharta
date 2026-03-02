import { TestBed } from "@angular/core/testing"
import { ApplyScenarioDialogComponent } from "./applyScenarioDialog.component"
import { ScenariosService } from "../../services/scenarios.service"
import { Scenario, ScenarioSectionKey } from "../../model/scenario.model"
import { ColorMode, MetricData } from "../../../../codeCharta.model"
import { defaultState } from "../../../../state/store/state.manager"

const createTestScenario = (): Scenario => ({
    id: "test-id",
    name: "Test Scenario",
    createdAt: Date.now(),
    sections: {
        metrics: {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            edgeMetric: "",
            distributionMetric: "rloc",
            isColorMetricLinkedToHeightMetric: false
        },
        colors: {
            colorRange: { from: 1, to: 10 },
            colorMode: ColorMode.weightedGradient,
            mapColors: defaultState.appSettings.mapColors
        },
        camera: { position: { x: 0, y: 300, z: 1000 }, target: { x: 0, y: 0, z: 0 } },
        filters: { blacklist: [], focusedNodePath: [] },
        labelsAndFolders: {
            amountOfTopLabels: 1,
            showMetricLabelNameValue: true,
            showMetricLabelNodeName: true,
            enableFloorLabels: false,
            colorLabels: { positive: false, negative: false, neutral: false },
            markedPackages: []
        }
    }
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
    let scenariosService: { applyScenario: jest.Mock }

    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()

        scenariosService = { applyScenario: jest.fn() }

        TestBed.configureTestingModule({
            imports: [ApplyScenarioDialogComponent],
            providers: [{ provide: ScenariosService, useValue: scenariosService }]
        })

        const fixture = TestBed.createComponent(ApplyScenarioDialogComponent)
        fixture.componentRef.setInput("scenario", createTestScenario())
        fixture.componentRef.setInput("metricData", metricDataWithMetrics)
        fixture.detectChanges()
        component = fixture.componentInstance
    })

    it("should have all available sections selected by default", () => {
        // Assert
        expect(component.hasAnySelected()).toBe(true)
        expect(component.selectedSections().metrics).toBe(true)
        expect(component.selectedSections().camera).toBe(true)
        expect(component.availableSectionKeys()).toEqual(["metrics", "colors", "camera", "filters", "labelsAndFolders"])
    })

    it("should detect no missing metrics when all are available", () => {
        // Assert
        expect(component.hasMissing()).toBe(false)
    })

    it("should detect missing metrics", () => {
        // Arrange
        const fixture = TestBed.createComponent(ApplyScenarioDialogComponent)
        fixture.componentRef.setInput("scenario", createTestScenario())
        fixture.componentRef.setInput("metricData", { nodeMetricData: [], edgeMetricData: [] })
        fixture.detectChanges()

        // Act
        const result = fixture.componentInstance.hasMissing()

        // Assert
        expect(result).toBe(true)
    })

    it("should call applyScenario with only selected sections", () => {
        // Arrange
        component.toggleSection("camera", false)
        component.toggleSection("filters", false)

        // Act
        component.apply()

        // Assert
        expect(scenariosService.applyScenario).toHaveBeenCalledWith(
            component.scenario(),
            new Set<ScenarioSectionKey>(["metrics", "colors", "labelsAndFolders"]),
            metricDataWithMetrics
        )
    })

    it("should report hasAnySelected as false when all deselected", () => {
        // Arrange
        for (const key of component.availableSectionKeys()) {
            component.toggleSection(key, false)
        }

        // Assert
        expect(component.hasAnySelected()).toBe(false)
    })

    describe("partial (built-in) scenario", () => {
        let partialComponent: ApplyScenarioDialogComponent

        beforeEach(() => {
            const partialScenario: Scenario = {
                id: "built-in-rloc",
                name: "RLOC",
                createdAt: 0,
                isBuiltIn: true,
                sections: {
                    metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" },
                    colors: { colorRange: { from: 250, to: 500 } }
                }
            }
            const fixture = TestBed.createComponent(ApplyScenarioDialogComponent)
            fixture.componentRef.setInput("scenario", partialScenario)
            fixture.componentRef.setInput("metricData", metricDataWithMetrics)
            fixture.detectChanges()
            partialComponent = fixture.componentInstance
        })

        it("should only expose available section keys", () => {
            // Assert
            expect(partialComponent.availableSectionKeys()).toEqual(["metrics", "colors"])
        })

        it("should not report missing metrics for undefined optional fields", () => {
            // Assert
            expect(partialComponent.hasMissing()).toBe(false)
        })

        it("should apply only available sections", () => {
            // Act
            partialComponent.apply()

            // Assert
            expect(scenariosService.applyScenario).toHaveBeenCalledWith(
                partialComponent.scenario(),
                new Set(["metrics", "colors"]),
                metricDataWithMetrics
            )
        })
    })
})
