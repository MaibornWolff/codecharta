import { Inject, Injectable } from "@angular/core"
import { tap } from "rxjs"
import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { ofType } from "../../angular-redux/ofType"
import { readFiles } from "./readFiles"

@Injectable()
export class UploadFilesEffect {
	static uploadCustomConfigsActionType = "uploadCustomConfigsActionType"

	constructor(@Inject(ActionsToken) private actions$: Actions) {}

	uploadFiles = createEffect(
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
		const fileInput = this.createFileInput()
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

	private createFileInput() {
		const fileInput = document.createElement("INPUT") as HTMLInputElement
		fileInput.type = "file"
		fileInput.accept = ".json,.gz"
		fileInput.multiple = true
		return fileInput
	}
}
