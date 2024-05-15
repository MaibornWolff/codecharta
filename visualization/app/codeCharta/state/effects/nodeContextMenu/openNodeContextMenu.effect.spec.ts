import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { setRightClickedNodeData } from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { NodeContextMenuService } from "./nodeContextMenu.service"
import { OpenNodeContextMenuEffect } from "./openNodeContextMenu.effect"
import { Action } from "@ngrx/store"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { provideMockStore } from "@ngrx/store/testing"

describe("OpenNodeContextMenuEffect", () => {
    let openSpy
    let actions$: Subject<Action>

    beforeEach(async () => {
        openSpy = jest.fn()
        actions$ = new Subject<Action>()
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([OpenNodeContextMenuEffect])],
            providers: [
                { provide: NodeContextMenuService, useValue: { open: openSpy } },
                provideMockStore(),
                provideMockActions(() => actions$)
            ]
        })
        await TestBed.inject(ApplicationInitStatus).donePromise
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should ignore empty rightClickedNodeData", () => {
        actions$.next(setRightClickedNodeData(null))
        expect(openSpy).not.toHaveBeenCalled()
    })

    it("should open node context menu", () => {
        actions$.next(setRightClickedNodeData({ value: { nodeId: 1, xPositionOfRightClickEvent: 2, yPositionOfRightClickEvent: 3 } }))
        expect(openSpy).toHaveBeenCalledTimes(1)
        expect(openSpy).toHaveBeenCalledWith(2, 3)
    })
})
