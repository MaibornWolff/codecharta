import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { ScenariosPanelComponent } from "./scenariosPanel.component"
import { ScenariosService } from "../../services/scenarios.service"
import { ScenarioApplierService } from "../../services/scenarioApplier.service"
import { ScenarioImportExportService } from "../../services/scenarioImportExport.service"

describe("ScenariosPanelComponent", () => {
    let component: ScenariosPanelComponent

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ScenariosPanelComponent],
            providers: [
                provideMockStore({ initialState: defaultState }),
                {
                    provide: ScenariosService,
                    useValue: {
                        scenarios$: of([]),
                        removeScenario: jest.fn(),
                        saveScenario: jest.fn(),
                        loadScenarios: jest.fn().mockResolvedValue(undefined)
                    }
                },
                {
                    provide: ScenarioApplierService,
                    useValue: {
                        applyScenario: jest.fn(),
                        getMissingMetrics: jest.fn().mockReturnValue({ nodeMetrics: [], edgeMetrics: [] }),
                        hasMissingMetrics: jest.fn().mockReturnValue(false),
                        getAvailableMetricNames: jest.fn().mockReturnValue({ nodeMetrics: new Set(), edgeMetrics: new Set() })
                    }
                },
                {
                    provide: ScenarioImportExportService,
                    useValue: {
                        exportScenario: jest.fn(),
                        importScenarioFiles: jest.fn().mockResolvedValue({ imported: 0, duplicates: [], invalid: [], parseErrors: [] })
                    }
                }
            ]
        })

        const fixture = TestBed.createComponent(ScenariosPanelComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it("should open scenario list dialog", () => {
        // Arrange
        component.listDialog().dialogElement().nativeElement.showModal = jest.fn()
        const spy = jest.spyOn(component.listDialog(), "open")

        // Act
        component.openScenarioList()

        // Assert
        expect(spy).toHaveBeenCalled()
    })

    it("should open save scenario dialog", () => {
        // Arrange
        component.saveDialog().dialogElement().nativeElement.showModal = jest.fn()
        const spy = jest.spyOn(component.saveDialog(), "open")

        // Act
        component.openSaveDialog()

        // Assert
        expect(spy).toHaveBeenCalled()
    })

    it("should set applyTarget on apply requested", () => {
        // Arrange
        const event = { scenario: {} as any, metricData: { nodeMetricData: [], edgeMetricData: [] } }

        // Act
        component.handleApplyRequested(event)

        // Assert
        expect(component.applyTarget()).toEqual(event)
    })

    it("should clear applyTarget on apply closed", () => {
        // Arrange
        component.applyTarget.set({ scenario: {} as any, metricData: { nodeMetricData: [], edgeMetricData: [] } })

        // Act
        component.handleApplyClosed()

        // Assert
        expect(component.applyTarget()).toBeNull()
    })
})
