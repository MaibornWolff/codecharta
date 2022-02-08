import "./removeFileButton.component.scss"
import { Component, Input } from "@angular/core"
import { FileState } from "../../../../model/files/files"
@Component({
	selector: "cc-remove-file-button",
	template: require("./removeFileButton.component.html")
})
export class RemoveFileButtonComponent {
	@Input() filename: string
	@Input() files: FileState[]
	@Input() onRemoveFile: (filename: string, event) => void
}
