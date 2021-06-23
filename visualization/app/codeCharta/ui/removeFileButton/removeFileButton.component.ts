import "./removeFileButton.component.scss"

export class RemoveFileButtonController {
	private filename: string
	private state: string
	private onRemoveFile

	onRemoveFileCall($event): void {
		this.onRemoveFile({ filename: this.filename, state: this.state, event: $event })
	}
}

export const removeFileButtonComponent = {
	selector: "removeFileButtonComponent",
	template: require("./removeFileButton.component.html"),
	controller: RemoveFileButtonController,
	bindings: { filename: "@", state: "@", onRemoveFile: "&" }
}
