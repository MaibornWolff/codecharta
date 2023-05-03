import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { removeFile } from "../../../../state/store/files/files.actions"

@Component({
	selector: "cc-remove-file-button",
	templateUrl: "./removeFileButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class RemoveFileButtonComponent {
	@Input() filename: string

	constructor(private store: Store) {}

	onRemoveFile(fileName: string, $event: MouseEvent) {
		this.store.dispatch(removeFile({ fileName }))

		$event.stopPropagation()
		$event.preventDefault()
	}
}
