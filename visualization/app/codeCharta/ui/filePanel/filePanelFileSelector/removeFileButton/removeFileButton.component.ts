import "./removeFileButton.component.scss"
import { Component, Inject, Input } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { removeFile } from "../../../../state/store/files/files.actions"

@Component({
	selector: "cc-remove-file-button",
	template: require("./removeFileButton.component.html")
})
export class RemoveFileButtonComponent {
	@Input() filename: string

	constructor(@Inject(Store) private store: Store) {}

	onRemoveFile(filename: string, $event: MouseEvent) {
		this.store.dispatch(removeFile(filename))

		$event.stopPropagation()
		$event.preventDefault()
	}
}
