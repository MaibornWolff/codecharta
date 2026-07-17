import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Subject } from "rxjs"
import { BlacklistItem, BlacklistType, CcState } from "../../../../model/codeCharta.model"
import { addBlacklistItems } from "../../../../stores/sharedView/sharedView.write.facade"
import { BlacklistExtensionEffect, blacklistExtensionsPattern } from "./blacklistExtension.effect"

describe("BlackListExtensionEffect", () => {
    let effect: BlacklistExtensionEffect
    let actions$: Subject<Action>
    let store: MockStore<CcState>

    beforeEach(() => {
        actions$ = new Subject()

        TestBed.configureTestingModule({
            providers: [BlacklistExtensionEffect, provideMockStore<CcState>({}), provideMockActions(() => actions$)]
        })
        store = TestBed.inject(MockStore)
        effect = TestBed.inject(BlacklistExtensionEffect)
        effect.blackListExtensions$.subscribe()

        jest.spyOn(store, "dispatch")
    })

    afterEach(() => {
        actions$.complete()
    })

    it.each<[BlacklistType]>([["flatten"], ["exclude"]])("should dispatch %s", blackListType => {
        // Arrange
        const extensionsToExclude = ["*.ts", "*.js"]
        const parsedItems: BlacklistItem[] = [
            { path: "*.ts", type: blackListType },
            { path: "*.js", type: blackListType }
        ]

        const action = blacklistExtensionsPattern(blackListType, ...extensionsToExclude)
        const expectedAction = addBlacklistItems({ items: parsedItems })

        // Act
        actions$.next(action)

        // Assert
        expect(store.dispatch).toHaveBeenCalledTimes(1)
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction)
    })
})
