import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { UploadFilesEffect } from "../../../state/effects/uploadFiles/uploadFiles.effect"

@Component({
	selector: "cc-upload-custom-config-button",
	template: require("./uploadCustomConfigButton.component.html")
})
export class UploadCustomConfigButtonComponent {
	constructor(@Inject(Store) private store: Store) {}

	upload() {
		this.store.dispatch({ type: UploadFilesEffect.uploadActionType })
	}
}
