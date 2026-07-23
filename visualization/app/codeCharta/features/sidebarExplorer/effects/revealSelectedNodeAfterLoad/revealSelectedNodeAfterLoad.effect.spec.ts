import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject, Subject } from "rxjs"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { RevealSelectedNodeAfterLoadEffect } from "./revealSelectedNodeAfterLoad.effect"

describe("RevealSelectedNodeAfterLoadEffect", () => {
    const revealService = { revealNode: jest.fn() }
    let actions$: Subject<unknown>
    let selectedBuildingId$: BehaviorSubject<string | null>

    const setup = (initialSelection: string | null) => {
        actions$ = new Subject()
        selectedBuildingId$ = new BehaviorSubject<string | null>(initialSelection)
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            providers: [
                RevealSelectedNodeAfterLoadEffect,
                provideMockStore(),
                provideMockActions(() => actions$),
                { provide: SharedViewReadWindow, useValue: { selectedBuildingId$ } },
                { provide: ExplorerRevealService, useValue: revealService }
            ]
        })
        TestBed.inject(RevealSelectedNodeAfterLoadEffect).revealSelectedNodeAfterLoad$.subscribe()
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should reveal the already-restored selection when a file finishes loading", () => {
        // Arrange
        setup("/root/src/main.ts")

        // Act
        actions$.next(filesLoaded({ payload: undefined } as never))

        // Assert — without expanding: a collapsed panel is a deliberate choice, and a load is not a
        expect(revealService.revealNode).toHaveBeenCalledWith("/root/src/main.ts", { expand: false })
    })

    it("should wait for a selection that is restored after the load lands", () => {
        // Arrange — the selection is restored a few dispatches after filesLoaded
        setup(null)
        actions$.next(filesLoaded({ payload: undefined } as never))
        expect(revealService.revealNode).not.toHaveBeenCalled()

        // Act
        selectedBuildingId$.next("/root/src/late.ts")

        // Assert
        expect(revealService.revealNode).toHaveBeenCalledWith("/root/src/late.ts", { expand: false })
    })

    it("should reveal only once per load", () => {
        // Arrange
        setup("/root/first.ts")

        // Act
        actions$.next(filesLoaded({ payload: undefined } as never))
        selectedBuildingId$.next("/root/second.ts")

        // Assert — later selections are the user clicking, not the load
        expect(revealService.revealNode).toHaveBeenCalledTimes(1)
    })

    it("should not reveal anything when the loaded file has no selection", () => {
        // Arrange
        setup(null)

        // Act
        actions$.next(filesLoaded({ payload: undefined } as never))

        // Assert
        expect(revealService.revealNode).not.toHaveBeenCalled()
    })
})
