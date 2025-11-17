import { Injectable } from "@angular/core"
import { SharpnessMode } from "../../../codeCharta.model"
import { DisplayQualityStore } from "../stores/displayQuality.store"

@Injectable({
    providedIn: "root"
})
export class DisplayQualityService {
    constructor(private readonly displayQualityStore: DisplayQualityStore) {}

    sharpnessMode$() {
        return this.displayQualityStore.sharpnessMode$
    }

    setSharpnessMode(value: SharpnessMode) {
        this.displayQualityStore.setSharpnessMode(value)
    }
}
