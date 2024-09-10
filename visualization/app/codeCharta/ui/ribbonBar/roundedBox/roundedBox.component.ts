import { Component, Input } from "@angular/core"

@Component({
    selector: "cc-rounded-box",
    templateUrl: "./roundedBox.component.html",
    styleUrl: "./roundedBox.component.scss"
})
export class RoundedBoxComponent {
    @Input()
    backgroundColor?: string
}
