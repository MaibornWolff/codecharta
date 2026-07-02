import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render } from "@testing-library/angular"
import { markPackages, unmarkPackage } from "../../../../sharedView/sharedView.facade"
import { getLastAction } from "../../../../util/testUtils/store.utils"
import { rightClickedCodeMapNodeSelector } from "../../../../state/selectors/rightClickedCodeMapNode.selector"
import { currentMarkColorSelector, markFolderItemsSelector } from "../../selectors/markFolderItems.selector"
import { MarkFolderRowComponent } from "./markFolderRow.component"

describe("markFolderRow component", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MarkFolderRowComponent],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: markFolderItemsSelector, value: [{ color: "red", isMarked: false }] },
                        { selector: currentMarkColorSelector, value: null },
                        { selector: rightClickedCodeMapNodeSelector, value: { path: "/root" } }
                    ]
                })
            ]
        })
    })

    it("should let a user mark and unmark a node", async () => {
        // Arrange
        const { container, detectChanges } = await render(MarkFolderRowComponent)
        const store = TestBed.inject(MockStore)

        expect(container.querySelectorAll(".colorButton").length).toBe(1)
        expect(container.querySelectorAll("cc-inline-color-picker").length).toBe(1)
        expect(container.querySelectorAll(".fa-xmark").length).toBe(0)

        // Act
        fireEvent.click(getFirstColorButton(container))

        // Assert
        expect(await getLastAction(store)).toEqual(markPackages({ packages: [{ path: "/root", color: "red" }] }))

        // Arrange
        store.overrideSelector(markFolderItemsSelector, [{ color: "red", isMarked: true }])
        store.refreshState()
        detectChanges()
        expect(container.querySelectorAll(".fa-xmark").length).toBe(1)

        // Act
        fireEvent.click(getFirstColorButton(container))

        // Assert
        expect(await getLastAction(store)).toEqual(unmarkPackage({ path: "/root" }))

        function getFirstColorButton(containerElement: Element) {
            return containerElement.querySelectorAll(".colorButton")[0]
        }
    })

    it("should offer to clear the colorization when a custom color is set", async () => {
        // Arrange
        const { container, detectChanges } = await render(MarkFolderRowComponent)
        const store = TestBed.inject(MockStore)
        expect(container.querySelector("button[title='Remove folder color']")).toBe(null)

        store.overrideSelector(currentMarkColorSelector, "#123456")
        store.refreshState()
        detectChanges()

        // Act
        fireEvent.click(container.querySelector("button[title='Remove folder color']"))

        // Assert
        expect(await getLastAction(store)).toEqual(unmarkPackage({ path: "/root" }))
    })

    it("should emit folderMarked when a preset color is clicked", async () => {
        // Arrange
        const folderMarkedSpy = jest.fn()
        const { container } = await render(MarkFolderRowComponent, {
            on: { folderMarked: folderMarkedSpy }
        })

        // Act
        fireEvent.click(container.querySelectorAll(".colorButton")[0])

        // Assert
        expect(folderMarkedSpy).toHaveBeenCalled()
    })
})
