import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapNode, Node } from "../../../codeCharta.model"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { DEFAULT_STATE, VALID_NODE } from "../../../util/dataMocks"
import { NodeSelectionService } from "../nodeSelection.service"
import { MetricChooserValueComponent } from "./metricChooserValue.component"
import { MetricChooserValueModule } from "./metricChooserValue.module"

describe("metricChooserValueComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MetricChooserValueModule],
            providers: [
                { provide: State, useValue: { getValue: () => DEFAULT_STATE } },
                { provide: NodeSelectionService, useValue: { createNodeObservable: jest.fn(() => of(null)) } },
                provideMockStore({
                    selectors: [
                        {
                            selector: primaryMetricNamesSelector,
                            value: {
                                areaMetric: "rloc",
                                heightMetric: "mcc"
                            }
                        }
                    ]
                })
            ]
        })
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should display attribute values of top level node when there is no hovered node", async () => {
        TestBed.overrideProvider(NodeSelectionService, {
            useValue: {
                createNodeObservable: jest.fn().mockReturnValue(of({ isLeaf: false, attributes: { rloc: 42 } } as unknown as Node))
            }
        })
        await render(MetricChooserValueComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { metricFor: "areaMetric" }
        })
        expect(screen.queryByText("42")).not.toBe(null)
        expect(screen.queryByText("Δ")).toBe(null)
    })

    it("should display attribute value", async () => {
        TestBed.overrideProvider(NodeSelectionService, {
            useValue: { createNodeObservable: jest.fn().mockReturnValue(of(VALID_NODE.children[0])) }
        })
        await render(MetricChooserValueComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { metricFor: "areaMetric" }
        })
        expect(screen.queryByText("100")).not.toBe(null)
        expect(screen.queryByText("Δ")).toBe(null)
    })

    it("should display zero height delta value in grey", async () => {
        TestBed.overrideProvider(NodeSelectionService, {
            useValue: {
                createNodeObservable: jest.fn().mockReturnValue(
                    of({
                        attributes: { mcc: 42 },
                        deltas: { mcc: 0 }
                    } as unknown as CodeMapNode)
                )
            }
        })
        const { container } = await render(MetricChooserValueComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { metricFor: "heightMetric" }
        })

        expect(screen.queryByText("Δ0")).not.toBe(null)
        const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
        expect(deltaContainer.style.backgroundColor).toBe("rgb(230, 230, 230)")
    })

    it("should display positive height delta value in green", async () => {
        TestBed.overrideProvider(NodeSelectionService, {
            useValue: {
                createNodeObservable: jest.fn().mockReturnValue(
                    of({
                        attributes: { mcc: 42 },
                        deltas: { mcc: 21 }
                    } as unknown as CodeMapNode)
                )
            }
        })
        const { container } = await render(MetricChooserValueComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { metricFor: "heightMetric" }
        })

        expect(screen.queryByText("Δ21")).not.toBe(null)
        const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
        expect(deltaContainer.style.backgroundColor).toBe("rgb(177, 216, 168)")
    })

    it("should display negative height delta value in red", async () => {
        TestBed.overrideProvider(NodeSelectionService, {
            useValue: {
                createNodeObservable: jest.fn().mockReturnValue(
                    of({
                        attributes: { mcc: 42 },
                        deltas: { mcc: -1 }
                    } as unknown as CodeMapNode)
                )
            }
        })
        const { container } = await render(MetricChooserValueComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { metricFor: "heightMetric" }
        })

        expect(screen.queryByText("Δ-1")).not.toBe(null)
        const deltaContainer = container.querySelector(".rounded-box.value") as HTMLElement
        expect(deltaContainer.style.backgroundColor).toBe("rgb(255, 204, 204)")
    })
})
