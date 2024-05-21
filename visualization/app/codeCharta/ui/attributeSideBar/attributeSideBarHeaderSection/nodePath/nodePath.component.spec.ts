import { render } from "@testing-library/angular"
import { CodeMapNode } from "../../../../codeCharta.model"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { NodePathComponent } from "./nodePath.component"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { TestBed } from "@angular/core/testing"

describe("nodePathComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: null },
                        { selector: isDeltaStateSelector, value: false }
                    ]
                })
            ]
        })
    })

    it("should display an empty p tag, if no building is selected", async () => {
        const { container } = await render(NodePathComponent, { componentProperties: { node: undefined } })
        const pTag = container.querySelector("p")
        expect(pTag).not.toBe(null)
        expect(pTag.textContent).toBe("")
    })

    it("should display only node path, when a file is selected", async () => {
        const node = { path: "some/file.ts" } as CodeMapNode
        const { container, detectChanges } = await render(NodePathComponent, { componentProperties: { node } })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(selectedNodeSelector, node)
        store.refreshState()
        detectChanges()

        expect(container.textContent).toContain("some/file.ts")
    })

    it("should display node path and amount of files, when a folder is selected and delta mode is disabled", async () => {
        const node = {
            children: [{}] as CodeMapNode[],
            path: "some/folder",
            attributes: { unary: 2 },
            fileCount: {
                added: 1,
                removed: 2
            }
        } as unknown as CodeMapNode
        const { container, detectChanges } = await render(NodePathComponent, { componentProperties: { node } })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(selectedNodeSelector, node)
        store.refreshState()
        detectChanges()

        expect(container.textContent.replaceAll(/\s+/g, " ")).toContain("some/folder ( 2 files )")
    })

    it("should display node path,amount of files, added and removed files, when a folder is selected and delta mode is enabled", async () => {
        const node = {
            children: [{}] as CodeMapNode[],
            path: "some/folder",
            attributes: { unary: 2 },
            fileCount: {
                added: 1,
                removed: 2,
                changed: 3
            }
        } as unknown as CodeMapNode
        const { container, detectChanges } = await render(NodePathComponent, { componentProperties: { node } })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(selectedNodeSelector, node)
        store.overrideSelector(isDeltaStateSelector, true)
        store.refreshState()
        detectChanges()

        expect(container.textContent.replaceAll(/\s+/g, " ")).toContain("some/folder ( 2 files | Δ1 | Δ-2 | Δ3 )")
    })

    it("should display amount of files with correct english grammar, when an empty folder is selected and delta mode is enabled", async () => {
        const node = {
            children: [{}] as CodeMapNode[],
            path: "some/emptyFolder",
            attributes: { unary: 0 },
            fileCount: {
                added: 0,
                removed: 2,
                changed: 0
            }
        } as unknown as CodeMapNode
        const { container, detectChanges } = await render(NodePathComponent, { componentProperties: { node } })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(selectedNodeSelector, node)
        store.overrideSelector(isDeltaStateSelector, true)
        store.refreshState()
        detectChanges()

        expect(container.textContent).toContain(" 0 files ") // because "zero file" is not grammatically correct
    })

    it("should display amount of files with correct english grammar, when a folder with 1 file is selected and delta mode is enabled", async () => {
        const node = {
            children: [{}] as CodeMapNode[],
            path: "some/folderWithOneFile",
            attributes: { unary: 1 },
            fileCount: {
                added: 1,
                removed: 0
            }
        } as unknown as CodeMapNode
        const { container, detectChanges } = await render(NodePathComponent, { componentProperties: { node } })
        const store = TestBed.inject(MockStore)
        store.overrideSelector(selectedNodeSelector, node)
        store.overrideSelector(isDeltaStateSelector, true)
        store.refreshState()
        detectChanges()

        expect(container.textContent).toContain(" 1 file ") // because "one files" is not grammatically correct
    })
})
