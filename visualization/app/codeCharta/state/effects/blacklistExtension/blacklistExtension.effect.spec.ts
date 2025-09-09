import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { BlacklistExtensionEffect, blacklistExtensionsPattern } from "./blacklistExtension.effect"
import { BlacklistItem, BlacklistType, CcState } from "../../../codeCharta.model"
import { addBlacklistItems } from "../../store/fileSettings/blacklist/blacklist.actions"

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
