import { Component, ElementRef } from "@angular/core"
import { MatSlideToggleChange, MatSlideToggle } from "@angular/material/slide-toggle"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { setPresentationMode } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { isPresentationModeSelector } from "../../../state/store/appSettings/isPresentationMode/isPresentationMode.selector"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-presentation-mode-button",
    templateUrl: "./presentationModeButton.component.html",
    styleUrls: ["./presentationModeButton.component.scss"],
    standalone: true,
    imports: [MatSlideToggle, AsyncPipe]
})
export class PresentationModeButtonComponent {
    isPresentationModeEnabled$ = this.store.select(isPresentationModeSelector)

    constructor(
        private readonly store: Store<CcState>,
        private readonly elementReference: ElementRef
    ) {}

    setPresentationModeEnabled(event: MatSlideToggleChange) {
        this.store.dispatch(setPresentationMode({ value: event.checked }))
        this.elementReference.nativeElement.querySelector("mat-slide-toggle").classList.remove("cdk-focused")
        this.elementReference.nativeElement.querySelector("mat-slide-toggle").classList.remove("cdk-program-focused")
        this.elementReference.nativeElement.querySelector("mat-slide-toggle").classList.remove("mat-mdc-slide-toggle-focused")
    }
}
