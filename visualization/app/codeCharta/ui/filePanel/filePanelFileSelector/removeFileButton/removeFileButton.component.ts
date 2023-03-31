import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { removeFile } from "../../../../state/store/files/files.actions"

@Component({
	selector: "cc-remove-file-button",
	templateUrl: "./removeFileButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class RemoveFileButtonComponent {
	@Input() filename: string

	constructor(private store: Store) {}

	onRemoveFile(filename: string, $event: MouseEvent) {
		this.store.dispatch(removeFile(filename))

		$event.stopPropagation()
		$event.preventDefault()
	}
}
