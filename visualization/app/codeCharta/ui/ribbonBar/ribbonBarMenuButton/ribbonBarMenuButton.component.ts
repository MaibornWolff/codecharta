import { Component, Input } from "@angular/core"

@Component({
    selector: "cc-ribbon-bar-menu-button",
    templateUrl: "./ribbonBarMenuButton.component.html",
    styleUrl: "./ribbonBarMenuButton.component.scss"
})
export class RibbonBarMenuButtonComponent {
    @Input({ required: true }) icon: string
    @Input({ required: true }) title: string
}
