import "./removeFileButton.component.scss"
import { Component, Input } from "@angular/core"

@Component({
	selector: "cc-remove-file-button",
	template: require("./removeFileButton.component.html")
})
export class RemoveFileButtonComponent {
	@Input() filename: string
	@Input() onRemoveFile: (filename: string, event) => void
}
