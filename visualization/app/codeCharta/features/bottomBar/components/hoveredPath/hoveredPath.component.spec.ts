import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { hoveredNodePathPanelDataSelector, selectedNodePathPanelDataSelector } from "../../selectors/hoveredNodePathPanelData.selector"
import { HoveredPathComponent } from "./hoveredPath.component"

describe("HoveredPathComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HoveredPathComponent]
        })
    })

    it("should render nothing when no node is hovered", async () => {
        // Arrange & Act
        const { container } = await render(HoveredPathComponent, {
            excludeComponentDeclaration: true,
            providers: [provideMockStore({ selectors: [{ selector: hoveredNodePathPanelDataSelector, value: undefined }] })]
        })

        // Assert
        expect(container.textContent.trim()).toBe("")
    })

    it("should render three segments with separators when path has three entries and mark the last segment bold", async () => {
        // Arrange & Act
        const { container } = await render(HoveredPathComponent, {
            excludeComponentDeclaration: true,
            providers: [
                provideMockStore({
                    selectors: [
                        {
                            selector: hoveredNodePathPanelDataSelector,
                            value: { path: ["root", "src", "a.ts"], isFile: true }
                        }
                    ]
                })
            ]
        })

        // Assert
        const separators = container.querySelectorAll("i.fa-angle-right")
        expect(separators.length).toBe(2)

        const lastSegment = container.querySelector(".font-semibold")
        expect(lastSegment.textContent).toBe("a.ts")

        const leadingIcon = container.querySelector(".font-semibold").previousElementSibling
        expect(leadingIcon.classList.contains("fa-file-o")).toBe(true)
    })

    it("should show the selected node's path when nothing is hovered and the fallback is enabled", async () => {
        // Arrange & Act — the domain view has no hoverable map, so it opts into the selected-node path
        const { container } = await render(HoveredPathComponent, {
            excludeComponentDeclaration: true,
            inputs: { showSelectedWhenNotHovered: true },
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: hoveredNodePathPanelDataSelector, value: undefined },
                        { selector: selectedNodePathPanelDataSelector, value: { path: ["root", "ParentLeaf"], isFile: false } }
                    ]
                })
            ]
        })

        // Assert
        expect(container.textContent).toContain("ParentLeaf")
    })

    it("should prefer the hovered node over the selected one when both exist", async () => {
        // Arrange & Act
        const { container } = await render(HoveredPathComponent, {
            excludeComponentDeclaration: true,
            inputs: { showSelectedWhenNotHovered: true },
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: hoveredNodePathPanelDataSelector, value: { path: ["root", "hovered.ts"], isFile: true } },
                        { selector: selectedNodePathPanelDataSelector, value: { path: ["root", "selected.ts"], isFile: true } }
                    ]
                })
            ]
        })

        // Assert
        expect(container.textContent).toContain("hovered.ts")
        expect(container.textContent).not.toContain("selected.ts")
    })

    it("should announce politely when the breadcrumb states the selected node instead of a hovered one", async () => {
        // Arrange & Act
        const { container } = await render(HoveredPathComponent, {
            excludeComponentDeclaration: true,
            inputs: { showSelectedWhenNotHovered: true },
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: hoveredNodePathPanelDataSelector, value: undefined },
                        { selector: selectedNodePathPanelDataSelector, value: { path: ["root", "ParentLeaf"], isFile: false } }
                    ]
                })
            ]
        })

        // Assert
        expect(container.querySelector("[aria-live='polite']")).not.toBe(null)
    })

    it("should stay silent for the hover-driven map view, where announcements would spam", async () => {
        // Arrange & Act
        const { container } = await render(HoveredPathComponent, {
            excludeComponentDeclaration: true,
            providers: [
                provideMockStore({
                    selectors: [{ selector: hoveredNodePathPanelDataSelector, value: { path: ["root", "a.ts"], isFile: true } }]
                })
            ]
        })

        // Assert
        expect(container.querySelector("[aria-live]")).toBe(null)
    })

    it("should render the folder icon when the hovered node is a folder", async () => {
        // Arrange & Act
        const { container } = await render(HoveredPathComponent, {
            excludeComponentDeclaration: true,
            providers: [
                provideMockStore({
                    selectors: [
                        {
                            selector: hoveredNodePathPanelDataSelector,
                            value: { path: ["root"], isFile: false }
                        }
                    ]
                })
            ]
        })

        // Assert
        const leadingIcon = container.querySelector(".font-semibold").previousElementSibling
        expect(leadingIcon.classList.contains("fa-folder")).toBe(true)
        expect(leadingIcon.classList.contains("fa-file-o")).toBe(false)
    })
})
