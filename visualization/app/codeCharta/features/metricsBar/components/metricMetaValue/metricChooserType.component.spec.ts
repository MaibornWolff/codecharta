import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { Observable, of } from "rxjs"
import { AttributeTypeValue, CodeMapNode, Node } from "../../../../codeCharta.model"
import { clone } from "../../../../util/clone"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { NodeSelectionService } from "../../services/nodeSelection.service"
import { MetricChooserTypeComponent } from "./metricChooserType.component"

describe("MetricChooserTypeComponent", () => {
    async function setup(options: { node$: Observable<CodeMapNode | Node | undefined>; state?: typeof defaultState }) {
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
                },
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

    const folderNode = { name: "root", children: [{ name: "file.ts" }] } as unknown as CodeMapNode
    const leafCodeMapNode = { name: "file.ts", children: [] } as unknown as CodeMapNode
    const leafRenderNode = { name: "file.ts", isLeaf: true } as unknown as Node
    const folderRenderNode = { name: "root", isLeaf: false } as unknown as Node

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

    it("should use the isLeaf property when the node is a render Node", async () => {
        // Arrange & Act
        const { fixture } = await setup({ node$: of(leafRenderNode) })
        const component = fixture.componentInstance

        // Assert
        expect(component.isNodeALeaf()).toBe(true)
    })

    it("should treat a render Node with isLeaf false as a folder", async () => {
        // Arrange & Act
        const { fixture } = await setup({ node$: of(folderRenderNode) })
        const component = fixture.componentInstance

        // Assert
        expect(component.isNodeALeaf()).toBe(false)
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
        state.fileSettings.attributeTypes = { nodes: { rloc: AttributeTypeValue.relative } }
        state.dynamicSettings.areaMetric = "rloc"

        // Act
        await setup({ node$: of(folderNode), state })

        // Assert
        expect(screen.getByText("x͂")).not.toBeNull()
    })
})
