import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setRightClickedNodeData } from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { NodeContextMenuService } from "./nodeContextMenu.service"
import { OpenNodeContextMenuEffect } from "./openNodeContextMenu.effect"

describe("OpenNodeContextMenuEffect", () => {
	let openSpy
	beforeEach(async () => {
		openSpy = jest.fn()
		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([OpenNodeContextMenuEffect])],
			providers: [{ provide: NodeContextMenuService, useValue: { open: openSpy } }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	it("should ignore empty rightClickedNodeData", () => {
		EffectsModule.actions$.next(setRightClickedNodeData(null))
		expect(openSpy).not.toHaveBeenCalled()
	})

	it("should open node context menu", () => {
		EffectsModule.actions$.next(setRightClickedNodeData({ nodeId: 1, xPositionOfRightClickEvent: 2, yPositionOfRightClickEvent: 3 }))
		expect(openSpy).toHaveBeenCalledTimes(1)
		expect(openSpy).toHaveBeenCalledWith(2, 3)
	})
})
