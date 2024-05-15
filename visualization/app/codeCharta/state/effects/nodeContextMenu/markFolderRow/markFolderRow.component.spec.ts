import { TestBed } from "@angular/core/testing"
import { fireEvent, render } from "@testing-library/angular"
import { MarkFolderRowComponent } from "./markFolderRow.component"
import { MarkFolderRowModule } from "./markFolderRow.module"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { markFolderItemsSelector } from "./selectors/markFolderItems.selector"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { getLastAction } from "../../../../util/testUtils/store.utils"
import { markPackages, unmarkPackage } from "../../../store/fileSettings/markedPackages/markedPackages.actions"

describe("markFolderRow component", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MarkFolderRowModule],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: markFolderItemsSelector, value: [{ color: "red", isMarked: false }] },
                        { selector: rightClickedCodeMapNodeSelector, value: { path: "/root" } }
                    ]
                })
            ]
        })
    })

    it("should let a user mark and unmark a node", async () => {
        const { container, detectChanges } = await render(MarkFolderRowComponent, { excludeComponentDeclaration: true })
        const store = TestBed.inject(MockStore)

        expect(container.querySelectorAll("button").length).toBe(1)
        expect(container.querySelectorAll("cc-color-picker").length).toBe(1)
        expect(container.querySelectorAll(".fa-times").length).toBe(0)

        fireEvent.click(getFirstColorButton(container))
        expect(await getLastAction(store)).toEqual(markPackages({ packages: [{ path: "/root", color: "red" }] }))

        store.overrideSelector(markFolderItemsSelector, [{ color: "red", isMarked: true }])
        store.refreshState()
        detectChanges()
        expect(container.querySelectorAll(".fa-times").length).toBe(1)
        expect(getFirstColorButton(container).querySelector(".fa-times")).not.toBe(null)

        fireEvent.click(getFirstColorButton(container))
        expect(await getLastAction(store)).toEqual(unmarkPackage({ path: "/root" }))

        store.overrideSelector(markFolderItemsSelector, [{ color: "red", isMarked: false }])
        store.refreshState()
        detectChanges()
        expect(container.querySelectorAll(".fa-times").length).toBe(0)

        function getFirstColorButton(container: Element) {
            return container.querySelectorAll("button[title='Colorize folder']")[0]
        }
    })
})
