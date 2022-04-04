import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { UploadFilesEffect } from "./uploadFiles.effect"

describe("uploadFilesEffect", () => {
	beforeEach(async () => {
		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UploadFilesEffect])]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	it("should ignore none upload actions", () => {
		const uploadFilesEffect = TestBed.inject(UploadFilesEffect)
		uploadFilesEffect["loadCustomConfigs"] = jest.fn()
		EffectsModule.actions$.next({ type: "whatever" })
		expect(uploadFilesEffect["loadCustomConfigs"]).not.toHaveBeenCalled()
	})

	it("should tap into uploadCustomConfigsActionType", () => {
		const uploadFilesEffect = TestBed.inject(UploadFilesEffect)
		uploadFilesEffect["loadCustomConfigs"] = jest.fn()
		EffectsModule.actions$.next({ type: UploadFilesEffect.uploadCustomConfigsActionType })
		expect(uploadFilesEffect["loadCustomConfigs"]).toHaveBeenCalled()
	})
})
