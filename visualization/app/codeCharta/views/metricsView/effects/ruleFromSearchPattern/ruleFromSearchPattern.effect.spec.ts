import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { first, Subject } from "rxjs"
import { ExcludeGuard } from "../../../../features/shared/facade"
import { searchPatternSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { addExcludedNodesIfNotResultsInEmptyMap, setSearchPattern } from "../../../../stores/sharedView/sharedView.write.facade"
import { RuleFromSearchPatternEffect, ruleFromSearchPattern } from "./ruleFromSearchPattern.effect"

describe("RuleFromSearchPatternEffect", () => {
    let effect: RuleFromSearchPatternEffect
    let actions$: Subject<Action>
    let doExcludedNodesResultInEmptyMap$: Subject<{ resultsInEmptyMap: boolean }>
    let store: MockStore

    beforeEach(() => {
        actions$ = new Subject()
        doExcludedNodesResultInEmptyMap$ = new Subject()

        TestBed.configureTestingModule({
            providers: [
                RuleFromSearchPatternEffect,
                { provide: ExcludeGuard, useValue: { doExcludedNodesResultInEmptyMap$ } },
                provideMockStore({ selectors: [{ selector: searchPatternSelector, value: "" }] }),
                provideMockActions(() => actions$)
            ]
        })
        effect = TestBed.inject(RuleFromSearchPatternEffect)
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
        doExcludedNodesResultInEmptyMap$.complete()
    })

    it("should exclude pattern and reset search pattern", () => {
        store.overrideSelector(searchPatternSelector, "needle")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        let firedEffect
        effect.excludeSearchPattern$.pipe(first()).subscribe(event => {
            firedEffect = event
        })
        actions$.next(ruleFromSearchPattern("exclude"))
        expect(firedEffect).toEqual(addExcludedNodesIfNotResultsInEmptyMap({ items: [{ path: "*needle*" }] }))

        doExcludedNodesResultInEmptyMap$.next({ resultsInEmptyMap: false })
        expect(dispatchSpy).toHaveBeenCalledWith(setSearchPattern({ value: "" }))
    })

    it("should not reset search pattern, when excluding from search bar failed / would result in an empty map", () => {
        store.overrideSelector(searchPatternSelector, "root")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        actions$.next(ruleFromSearchPattern("exclude"))
        doExcludedNodesResultInEmptyMap$.next({ resultsInEmptyMap: true })
        expect(dispatchSpy).not.toHaveBeenCalled()
    })
})
