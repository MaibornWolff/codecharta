// UPLOAD-FILES-FROM-UPLOAD-CUSTOM-CONFIG-BUTTON

import { Inject, Injectable } from "@angular/core"
import { tap } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../angular-redux/effects/effects.module"
import { ofType } from "../../angular-redux/ofType"
import { Store } from "../../angular-redux/store"

@Injectable()
export class UploadFilesEffect {
	constructor(@Inject(ActionsToken) private actions$: Actions, @Inject(Store) private store: Store) {}

	uploadFiles = createEffect(
		() =>
			this.actions$.pipe(
				ofType("UploadFilesFromUploadCustomConfigButtonComponent"),
				tap(() => {
					this.openFileChooser()
				})
			),
		{ dispatch: false }
	)

	private openFileChooser() {
		const fileInput = this.createFileInput()
		fileInput.addEventListener("change", () => {
			// console.log(fileInput.files.length)
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
