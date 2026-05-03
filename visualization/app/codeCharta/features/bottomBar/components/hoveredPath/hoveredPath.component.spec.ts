import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { hoveredNodePathPanelDataSelector } from "../../selectors/hoveredNodePathPanelData.selector"
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
