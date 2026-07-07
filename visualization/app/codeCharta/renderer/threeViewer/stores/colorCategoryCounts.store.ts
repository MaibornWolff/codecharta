import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export interface ColorCategoryCounts {
    positive: number
    neutral: number
    negative: number
}

// The per-color-category building counts (positive/neutral/negative) computed during a codeMap render.
// Published here by CodeMapRenderService and read by the legend/label features (labelSettingsPanel,
// colorBandsSection), so those features consume the render output WITHOUT importing the codeMap render
// service — which removed the last labelSettings -> codeMap edge (Slice 16c).
@Injectable({ providedIn: "root" })
export class ColorCategoryCountsStore {
    private readonly _colorCategoryCounts$ = new BehaviorSubject<ColorCategoryCounts>({ positive: 0, neutral: 0, negative: 0 })
    readonly colorCategoryCounts$ = this._colorCategoryCounts$.asObservable()

    setColorCategoryCounts(counts: ColorCategoryCounts) {
        this._colorCategoryCounts$.next(counts)
    }
}
