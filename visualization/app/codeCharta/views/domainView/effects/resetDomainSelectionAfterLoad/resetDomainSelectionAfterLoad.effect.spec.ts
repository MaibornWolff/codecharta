import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { Subject } from "rxjs"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { DomainSelectionStore } from "../../stores/domainSelection.store"
import { ResetDomainSelectionAfterLoadEffect } from "./resetDomainSelectionAfterLoad.effect"

describe("ResetDomainSelectionAfterLoadEffect", () => {
    const actions$ = new Subject<Action>()
    const domainSelectionStore = { clear: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        TestBed.configureTestingModule({
            providers: [
                ResetDomainSelectionAfterLoadEffect,
                provideMockActions(() => actions$),
                { provide: DomainSelectionStore, useValue: domainSelectionStore }
            ]
        })
        TestBed.inject(ResetDomainSelectionAfterLoadEffect).resetDomainSelectionAfterLoad$.subscribe()
    })

    it("should clear the domain selection when a file set loads, so a stale path cannot outlive its file", () => {
        // Arrange & Act
        actions$.next({ type: filesLoaded.type })

        // Assert
        expect(domainSelectionStore.clear).toHaveBeenCalledTimes(1)
    })

    it("should not clear the domain selection for unrelated actions", () => {
        // Arrange & Act
        actions$.next({ type: "SOME_OTHER_ACTION" })

        // Assert
        expect(domainSelectionStore.clear).not.toHaveBeenCalled()
    })
})
