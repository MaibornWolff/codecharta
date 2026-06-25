import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { Observable, of } from "rxjs"
import { CodeMapNode, Node } from "../../../../codeCharta.model"
import { primaryMetricNamesSelector } from "../../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { MetricMetaValueComponent } from "./metricMetaValue.component"

const metricNames = {
    areaMetric: "rloc",
    heightMetric: "mcc",
    colorMetric: "mcc",
    edgeMetric: "avgCommit"
}

async function setup(node: Partial<CodeMapNode | Node> | undefined, metricFor: keyof typeof metricNames = "heightMetric") {
    const nodeSelectionServiceMock = {
        createNodeObservable: (): Observable<CodeMapNode | Node | undefined> => of(node as CodeMapNode | Node | undefined)
    }

    return render(MetricMetaValueComponent, {
        inputs: { metricFor },
        providers: [
            provideMockStore({
                initialState: defaultState,
                selectors: [{ selector: primaryMetricNamesSelector, value: metricNames }]
            }),
            { provide: State, useValue: { getValue: () => defaultState } },
            { provide: NodeSelectionService, useValue: nodeSelectionServiceMock },
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
}

describe("MetricMetaValueComponent", () => {
    it("should render a locale-formatted metric value for the selected metric", async () => {
        // Arrange & Act
        await setup({ attributes: { mcc: 1234 } } as Partial<CodeMapNode>)

        // Assert
        expect(screen.getByText((1234).toLocaleString())).not.toBeNull()
    })

    it("should show the missing-value dash when the node has no value for the metric", async () => {
        // Arrange
        const { fixture } = await setup({ attributes: {} } as Partial<CodeMapNode>)
        const component = fixture.componentInstance as MetricMetaValueComponent

        // Act & Assert
        expect(component.display()?.value).toBe("—")
        expect(screen.getByText("—")).not.toBeNull()
    })

    it("should render a placeholder and no display when no node is selected", async () => {
        // Arrange
        const { fixture } = await setup(undefined)
        const component = fixture.componentInstance as MetricMetaValueComponent

        // Act & Assert
        expect(component.node()).toBeUndefined()
        expect(component.display()).toBeNull()
        expect(screen.queryByText("—")).toBeNull()
    })

    it("should style a positive heightMetric delta as success", async () => {
        // Arrange
        const node = { attributes: { mcc: 10 }, deltas: { mcc: 5 } } as Partial<Node>
        const { fixture } = await setup(node, "heightMetric")
        const component = fixture.componentInstance as MetricMetaValueComponent

        // Act & Assert
        expect(component.display()?.delta).toEqual({ label: (5).toLocaleString(), styleClass: "text-success" })
        expect(screen.getByText(`Δ${(5).toLocaleString()}`)).not.toBeNull()
    })

    it("should style a negative delta as error regardless of metric", async () => {
        // Arrange
        const node = { attributes: { mcc: 10 }, deltas: { mcc: -7 } } as Partial<Node>
        const { fixture } = await setup(node, "heightMetric")
        const component = fixture.componentInstance as MetricMetaValueComponent

        // Act & Assert
        expect(component.display()?.delta?.styleClass).toBe("text-error")
    })

    it("should style a positive non-heightMetric delta as base content", async () => {
        // Arrange
        const node = { attributes: { mcc: 10 }, deltas: { mcc: 5 } } as Partial<Node>
        const { fixture } = await setup(node, "colorMetric")
        const component = fixture.componentInstance as MetricMetaValueComponent

        // Act & Assert
        expect(component.display()?.delta?.styleClass).toBe("text-base-content")
    })

    it("should show no delta when the node carries no deltas", async () => {
        // Arrange
        const { fixture } = await setup({ attributes: { mcc: 10 } } as Partial<CodeMapNode>)
        const component = fixture.componentInstance as MetricMetaValueComponent

        // Act & Assert
        expect(component.display()?.delta).toBeNull()
    })
})
