import { Component, Inject } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"

@Component({
	selector: "cc-upload-custom-config-button",
	template: require("./uploadCustomConfigButton.component.html")
})
export class UploadCustomConfigButtonComponent {
	constructor(@Inject(Store) private store: Store) {}

	upload() {
		this.store.dispatch({ type: "UploadFilesFromUploadCustomConfigButtonComponent" })
	}
}
