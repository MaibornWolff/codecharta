import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { first, Subject } from "rxjs"
import { searchPatternSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { addExcludedNodesIfNotResultsInEmptyMap, setSearchPattern } from "../../../../stores/sharedView/sharedView.write.facade"
import { ExcludeGuard } from "../../../shared/facade"
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
        // Arrange
        store.overrideSelector(searchPatternSelector, "needle")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")
        let firedEffect
        effect.excludeSearchPattern$.pipe(first()).subscribe(event => {
            firedEffect = event
        })

        // Act
        actions$.next(ruleFromSearchPattern("exclude"))
        doExcludedNodesResultInEmptyMap$.next({ resultsInEmptyMap: false })

        // Assert
        expect(firedEffect).toEqual(addExcludedNodesIfNotResultsInEmptyMap({ items: [{ path: "*needle*" }] }))
        expect(dispatchSpy).toHaveBeenCalledWith(setSearchPattern({ value: "" }))
    })

    it("should not reset search pattern, when excluding from search bar failed / would result in an empty map", () => {
        // Arrange
        store.overrideSelector(searchPatternSelector, "root")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        actions$.next(ruleFromSearchPattern("exclude"))
        doExcludedNodesResultInEmptyMap$.next({ resultsInEmptyMap: true })

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })
})
