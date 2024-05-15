import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { MaterialModule } from "../../../../material/material.module"
import { removeBlacklistItem } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { BlacklistPanelComponent } from "./blacklistPanel.component"
import { Store } from "@ngrx/store"
import { BehaviorSubject } from "rxjs"
import { BlacklistItem } from "../../../codeCharta.model"

const placeholderText = "Add pattern via search or node context-menu"

describe("blacklistPanel", () => {
    let flattenedItems$: BehaviorSubject<BlacklistItem[]>
    let excludedItems$: BehaviorSubject<BlacklistItem[]>
    let dispatchSpy: jest.Mock

    beforeEach(() => {
        flattenedItems$ = new BehaviorSubject([])
        excludedItems$ = new BehaviorSubject([])
        dispatchSpy = jest.fn()
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            providers: [{ provide: Store, useValue: { select: () => new BehaviorSubject([]), dispatch: dispatchSpy } }]
        })
    })

    afterEach(() => {
        flattenedItems$.complete()
        excludedItems$.complete()
    })

    it("should have place holder texts when there are no flattened nor excluded items", async () => {
        await render(BlacklistPanelComponent)
        expect(screen.getAllByText(placeholderText).length).toBe(2)
    })

    it("should display all flattened and excluded items in the correct section and remove an item on click", async () => {
        const { fixture, detectChanges } = await render(BlacklistPanelComponent)
        flattenedItems$.next([{ type: "flatten", path: "some/flattened/building.ts" }])
        excludedItems$.next([{ type: "exclude", path: "some/excluded/building.ts" }])
        fixture.componentInstance.flattenedItems$ = flattenedItems$
        fixture.componentInstance.excludedItems$ = excludedItems$
        detectChanges()

        expect(screen.queryByText(placeholderText)).toBe(null)
        expect(screen.getByText("some/flattened/building.ts")).not.toBe(null)
        expect(screen.getByText("some/excluded/building.ts")).not.toBe(null)

        await userEvent.click(screen.getByText("some/excluded/building.ts"))
        expect(dispatchSpy).toHaveBeenCalledWith(
            removeBlacklistItem({
                item: {
                    type: "exclude",
                    path: "some/excluded/building.ts"
                }
            })
        )
    })
})
