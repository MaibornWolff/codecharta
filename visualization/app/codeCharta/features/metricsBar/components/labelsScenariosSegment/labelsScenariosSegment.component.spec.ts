import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { BehaviorSubject, of } from "rxjs"
import { ColorMode } from "../../../../codeCharta.model"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { Scenario, ScenariosService } from "../../../scenarios/facade"
import { LabelsScenariosSegmentComponent } from "./labelsScenariosSegment.component"

const createScenario = (name: string, id = "id-1"): Scenario => ({
    id,
    name,
    createdAt: 0,
    isBuiltIn: true,
    sections: {
        metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" },
        colors: { colorRange: { from: 1, to: 10 }, colorMode: ColorMode.weightedGradient }
    }
})

describe("LabelsScenariosSegmentComponent", () => {
    let scenariosSubject: BehaviorSubject<Scenario[]>
    let scenariosService: { scenarios$: BehaviorSubject<Scenario[]>; loadScenarios: jest.Mock }

    async function setup(initialScenarios: Scenario[] = []) {
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()

        scenariosSubject = new BehaviorSubject<Scenario[]>(initialScenarios)
        scenariosService = {
            scenarios$: scenariosSubject,
            loadScenarios: jest.fn().mockResolvedValue(undefined)
        }

        const renderResult = await render(LabelsScenariosSegmentComponent, {
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ScenariosService, useValue: scenariosService },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: () => [],
                        sortVisibleNodesByHeightDescending: () => [],
                        colorCategoryCounts$: of({ positive: 0, neutral: 0, negative: 0 })
                    }
                }
            ]
        })
        return { ...renderResult, component: renderResult.fixture.componentInstance }
    }

    it("should render the labels and scenario segment test ids and child controls", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-labels")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-scenario")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-scenario-save")).not.toBeNull()
    })

    it("should load scenarios on init", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(scenariosService.loadScenarios).toHaveBeenCalled()
    })

    it("should pluralize the scenarios count label for zero and many scenarios", async () => {
        // Arrange & Act
        const { component, fixture } = await setup([])

        // Assert
        expect(component.scenariosCountLabel()).toBe("0 scenarios available")

        // Act
        scenariosSubject.next([createScenario("A", "a"), createScenario("B", "b")])
        fixture.detectChanges()

        // Assert
        expect(component.scenariosCountLabel()).toBe("2 scenarios available")
    })

    it("should use the singular form of the count label for exactly one scenario", async () => {
        // Arrange & Act
        const { component } = await setup([createScenario("Only", "only")])

        // Assert
        expect(component.scenariosCountLabel()).toBe("1 scenario available")
    })

    it("should set and clear the apply target when handling apply requests", async () => {
        // Arrange
        const { component } = await setup()
        const scenario = createScenario("Apply Me", "apply")
        const metricData = { nodeMetricData: [], edgeMetricData: [] }

        // Act
        component.handleApplyRequested({ scenario, metricData })

        // Assert
        expect(component.applyTarget()).toEqual({ scenario, metricData })

        // Act
        component.handleApplyClosed()

        // Assert
        expect(component.applyTarget()).toBeNull()
    })

    it("should open the save and list dialogs through their view children", async () => {
        // Arrange
        const { component } = await setup()
        const saveOpenSpy = jest.spyOn(component.saveDialog(), "open")
        const listOpenSpy = jest.spyOn(component.listDialog(), "open")

        // Act
        component.openSaveDialog()
        component.openScenarioList()

        // Assert
        expect(saveOpenSpy).toHaveBeenCalled()
        expect(listOpenSpy).toHaveBeenCalled()
    })
})
