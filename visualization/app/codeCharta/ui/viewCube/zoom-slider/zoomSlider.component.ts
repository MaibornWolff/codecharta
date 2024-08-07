import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { cameraZoomFactorSelector } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.selector"
import { setCameraZoomFactor, zoomOut, zoomIn } from "../../../state/store/appStatus/cameraZoomFactor/cameraZoomFactor.actions"

@Component({
    selector: "cc-zoom-slider",
    templateUrl: "./zoomSlider.component.html",
    styleUrl: "./zoomSlider.component.scss"
})
export class ZoomSliderComponent {
    zoomFactor: number

    constructor(private store: Store<CcState>) {
        this.store.select(cameraZoomFactorSelector).subscribe(zoom => {
            this.zoomFactor = zoom * 100
        })
    }
    zoomIn() {
        this.store.dispatch(zoomIn())
    }

    zoomOut() {
        this.store.dispatch(zoomOut())
    }

    onInput(event: Event) {
        const inputElement = event.target as HTMLInputElement
        this.store.dispatch(setCameraZoomFactor({ value: Number.parseInt(inputElement.value) / 100 }))
    }
}
