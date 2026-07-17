import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject } from "rxjs"
import { FILE_STATES_JAVA } from "../../../../mocks/dataMocks"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/store/visibleFileStates.selector"
import { blacklistSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { addBlacklistItems, addBlacklistItemsIfNotResultsInEmptyMap } from "../../../../stores/sharedView/sharedView.write.facade"
import { isPendingHeavyDispatch$ } from "../../../../util/dispatchAfterPaint"
import { ErrorDialogService } from "../../../../util/errorDialog/errorDialog.service"
import { getLastAction } from "../../../../util/testUtils/store.utils"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./addBlacklistItemsIfNotResultsInEmptyMap.effect"

describe("AddBlacklistItemsIfNotResultsInEmptyMapEffect", () => {
    const mockedErrorDialogService = { open: jest.fn() }
    let actions$: BehaviorSubject<Action>
    let store: MockStore

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        mockedErrorDialogService.open = jest.fn()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([AddBlacklistItemsIfNotResultsInEmptyMapEffect])],
            providers: [
                { provide: ErrorDialogService, useValue: mockedErrorDialogService },
                provideMockStore({
                    selectors: [
                        {
                            selector: visibleFileStatesSelector,
                            value: []
                        },
                        {
                            selector: blacklistSelector,
                            value: []
                        }
                    ]
                }),
                provideMockActions(() => actions$)
            ]
        })
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
        isPendingHeavyDispatch$.next(false)
    })

    it("should ignore a not relevant action", async () => {
        actions$.next({ type: "whatever" })
        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
        expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
    })

    it("should not blacklist items if it would lead to an empty map but show error dialog", () => {
        actions$.next(addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ type: "exclude", path: "foo/bar" }] }))
        store.refreshState()
        expect(mockedErrorDialogService.open).toHaveBeenCalledTimes(1)
    })

    it("should clear the pending heavy dispatch spinner when the exclude would result in an empty map", () => {
        // Arrange
        isPendingHeavyDispatch$.next(true)

        // Act
        actions$.next(addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ type: "exclude", path: "foo/bar" }] }))
        store.refreshState()

        // Assert
        expect(isPendingHeavyDispatch$.value).toBe(false)
    })

    it("should blacklist items if it doesn't lead to an empty map", async () => {
        store.overrideSelector(visibleFileStatesSelector, FILE_STATES_JAVA)
        store.refreshState()
        actions$.next(addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ type: "exclude", path: "/root/src/main/file1.java" }] }))

        expect(await getLastAction(store)).toEqual(addBlacklistItems({ items: [{ type: "exclude", path: "/root/src/main/file1.java" }] }))
        expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
    })
})
