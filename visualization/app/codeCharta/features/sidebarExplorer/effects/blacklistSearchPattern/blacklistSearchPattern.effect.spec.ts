import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { first, Subject } from "rxjs"
import { searchPatternSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { addBlacklistItemsIfNotResultsInEmptyMap, setSearchPattern } from "../../../../stores/sharedView/sharedView.write.facade"
import { BlacklistExclusionGuard } from "../../../shared/facade"
import { BlacklistSearchPatternEffect, blacklistSearchPattern } from "./blacklistSearchPattern.effect"

describe("BlacklistSearchPatternEffect", () => {
    let effect: BlacklistSearchPatternEffect
    let actions$: Subject<Action>
    let doBlacklistItemsResultInEmptyMap$: Subject<{ resultsInEmptyMap: boolean }>
    let store: MockStore

    beforeEach(() => {
        actions$ = new Subject()
        doBlacklistItemsResultInEmptyMap$ = new Subject()

        TestBed.configureTestingModule({
            providers: [
                BlacklistSearchPatternEffect,
                { provide: BlacklistExclusionGuard, useValue: { doBlacklistItemsResultInEmptyMap$ } },
                provideMockStore({ selectors: [{ selector: searchPatternSelector, value: "" }] }),
                provideMockActions(() => actions$)
            ]
        })
        effect = TestBed.inject(BlacklistSearchPatternEffect)
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
        doBlacklistItemsResultInEmptyMap$.complete()
    })

    it("should exclude pattern and reset search pattern", () => {
        store.overrideSelector(searchPatternSelector, "needle")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        let firedEffect
        effect.excludeSearchPattern$.pipe(first()).subscribe(event => {
            firedEffect = event
        })
        actions$.next(blacklistSearchPattern("exclude"))
        expect(firedEffect).toEqual(addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ type: "exclude", path: "*needle*" }] }))

        doBlacklistItemsResultInEmptyMap$.next({ resultsInEmptyMap: false })
        expect(dispatchSpy).toHaveBeenCalledWith(setSearchPattern({ value: "" }))
    })

    it("should not reset search pattern, when excluding from search bar failed / would result in an empty map", () => {
        store.overrideSelector(searchPatternSelector, "root")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        actions$.next(blacklistSearchPattern("exclude"))
        doBlacklistItemsResultInEmptyMap$.next({ resultsInEmptyMap: true })
        expect(dispatchSpy).not.toHaveBeenCalled()
    })
})
