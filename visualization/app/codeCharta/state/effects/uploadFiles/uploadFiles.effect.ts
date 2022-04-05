import { Inject, Injectable } from "@angular/core"
import { tap } from "rxjs"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { ofType } from "../../angular-redux/ofType"
import { readFiles } from "../../../util/uploadFiles/readFiles"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"

@Injectable()
export class UploadFilesEffect {
	static uploadCustomConfigsActionType = "uploadCustomConfigsActionType"

	constructor(@Inject(ActionsToken) private actions$: Actions) {}

	uploadCustomConfigs = createEffect(
		() =>
			this.actions$.pipe(
				ofType(UploadFilesEffect.uploadCustomConfigsActionType),
				tap(() => {
					this.loadCustomConfigs()
				})
			),
		{ dispatch: false }
	)

	private loadCustomConfigs() {
		const fileInput = createCCFileInput()
		fileInput.addEventListener("change", async () => {
			const customConfigsContent = await Promise.all(readFiles(fileInput.files))
			for (const customConfigContent of customConfigsContent) {
				try {
					CustomConfigHelper.importCustomConfigs(customConfigContent)
				} catch {
					// Explicitly ignored
				}
			}
		})
		fileInput.click()
	}
}
