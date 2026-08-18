import { Component } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { BehaviorSubject, Subject } from "rxjs"
import { ExplorerRevealService } from "../../../features/sidebarExplorer/facade"
import { filesLoaded } from "../../../stores/fileStore/fileStore.facade"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { RevealsSelectedNodeAfterLoadDirective } from "./revealsSelectedNodeAfterLoad.directive"

const revealService = { revealNode: jest.fn() }

@Component({
    selector: "cc-reveals-selected-node-after-load-host",
    template: "",
    hostDirectives: [RevealsSelectedNodeAfterLoadDirective],
    providers: [{ provide: ExplorerRevealService, useValue: revealService }]
})
class HostComponent {}

describe("RevealsSelectedNodeAfterLoadDirective", () => {
    let actions$: Subject<unknown>
    let selectedBuildingId$: BehaviorSubject<string | null>

    const setup = async (initialSelection: string | null) => {
        actions$ = new Subject()
        selectedBuildingId$ = new BehaviorSubject<string | null>(initialSelection)
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            providers: [
                provideMockStore(),
                provideMockActions(() => actions$),
                { provide: SharedViewReadWindow, useValue: { selectedBuildingId$ } }
            ]
        })
        return render(HostComponent)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should reveal the already-restored selection when a file finishes loading", async () => {
        // Arrange
        await setup("/root/src/main.ts")

        // Act
        actions$.next(filesLoaded({ payload: undefined } as never))

        // Assert — without expanding: a collapsed panel is a deliberate choice, and a load is not a reason to overrule it
        expect(revealService.revealNode).toHaveBeenCalledWith("/root/src/main.ts", { expand: false })
    })

    it("should wait for a selection that is restored after the load lands", async () => {
        // Arrange
        await setup(null)
        actions$.next(filesLoaded({ payload: undefined } as never))
        expect(revealService.revealNode).not.toHaveBeenCalled()

        // Act
        selectedBuildingId$.next("/root/src/late.ts")

        // Assert
        expect(revealService.revealNode).toHaveBeenCalledWith("/root/src/late.ts", { expand: false })
    })

    it("should reveal only once per load", async () => {
        // Arrange
        await setup("/root/first.ts")

        // Act
        actions$.next(filesLoaded({ payload: undefined } as never))
        selectedBuildingId$.next("/root/second.ts")

        // Assert — later selections are the user clicking, not the load
        expect(revealService.revealNode).toHaveBeenCalledTimes(1)
    })

    it("should not reveal anything when the loaded file has no selection", async () => {
        // Arrange
        await setup(null)

        // Act
        actions$.next(filesLoaded({ payload: undefined } as never))

        // Assert
        expect(revealService.revealNode).not.toHaveBeenCalled()
    })

    it("should stop revealing once the host view is destroyed", async () => {
        // Arrange
        const { fixture } = await setup("/root/src/main.ts")

        // Act
        fixture.destroy()
        actions$.next(filesLoaded({ payload: undefined } as never))

        // Assert
        expect(revealService.revealNode).not.toHaveBeenCalled()
    })
})
