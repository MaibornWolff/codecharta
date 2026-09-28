import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { Observable, of } from "rxjs"
import { AttributeTypeValue, CodeMapNode } from "../../../../model/codeCharta.model"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { clone } from "../../../../util/clone"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { MetricChooserTypeComponent } from "./metricChooserType.component"

describe("MetricChooserTypeComponent", () => {
    async function setup(options: { node$: Observable<CodeMapNode | undefined>; state?: typeof defaultState }) {
        return render(MetricChooserTypeComponent, {
            inputs: {
                metricFor: "areaMetric",
                attributeType: "nodes"
            },
            providers: [
                provideMockStore({ initialState: options.state ?? defaultState }),
                { provide: State, useValue: { getValue: () => options.state ?? defaultState } },
                {
                    provide: NodeSelectionService,
                    useValue: { createNodeObservable: () => options.node$ }
                }
            ]
        })
    }

    const folderNode = { name: "root", children: [{ name: "file.ts" }] } as unknown as CodeMapNode
    const leafCodeMapNode = { name: "file.ts", children: [] } as unknown as CodeMapNode

    it("should be visible (not hidden) for a folder node", async () => {
        // Arrange & Act
        const { fixture } = await setup({ node$: of(folderNode) })
        const component = fixture.componentInstance

        // Assert
        expect(component.isNodeALeaf()).toBe(false)
        expect(screen.getByText("Σ").hidden).toBe(false)
    })

    it("should be hidden for a leaf node detected via empty children", async () => {
        // Arrange & Act
        const { fixture } = await setup({ node$: of(leafCodeMapNode) })
        const component = fixture.componentInstance

        // Assert
        expect(component.isNodeALeaf()).toBe(true)
        expect(screen.getByText("Σ").hidden).toBe(true)
    })

    it("should not treat an undefined node as a leaf", async () => {
        // Arrange & Act
        const { fixture } = await setup({ node$: of(undefined) })
        const component = fixture.componentInstance

        // Assert
        expect(component.isNodeALeaf()).toBe(false)
    })

    it("should show the absolute indicator 'Σ' when the attribute type is absolute", async () => {
        // Arrange & Act
        await setup({ node$: of(folderNode) })

        // Assert
        expect(screen.getByText("Σ")).not.toBeNull()
    })

    it("should show the relative indicator 'x͂' when the attribute type is relative", async () => {
        // Arrange
        const state = clone(defaultState)
        state.metricsLensSource.attributeTypes = { rloc: AttributeTypeValue.relative }
        state.mapState.areaMetric = "rloc"

        // Act
        await setup({ node$: of(folderNode), state })

        // Assert
        expect(screen.getByText("x͂")).not.toBeNull()
    })
})
