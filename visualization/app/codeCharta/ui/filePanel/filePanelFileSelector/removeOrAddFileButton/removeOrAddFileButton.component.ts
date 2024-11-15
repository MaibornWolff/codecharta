import { Component, EventEmitter, Input, Output } from "@angular/core"

@Component({
    selector: "cc-remove-file-button",
    templateUrl: "./removeOrAddFileButton.component.html",
    styleUrls: ["/removeOrAddFileButton.component.scss"],
    standalone: true
})
export class RemoveOrAddFileButtonComponent {
    @Input() filename: string
    @Input() isRemoved: boolean
    @Output() removeOrAddFile: EventEmitter<string> = new EventEmitter<string>()

    onRemoveOrAddFile(fileName: string, $event: MouseEvent) {
        this.removeOrAddFile.emit(fileName)

        $event.stopPropagation()
        $event.preventDefault()
    }
}
