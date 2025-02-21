import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { createEffect } from "@ngrx/effects"
import { filter, mergeMap, withLatestFrom } from "rxjs"
import { colorLabelsSelector } from "../../store/appSettings/colorLabels/colorLabels.selector"
import { showMetricLabelNodeValueSelector } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.selector"
import { setShowMetricLabelNameValue } from "../../store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { showMetricLabelNodeNameSelector } from "../../store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.selector"
import { CcState, ColorLabelOptions } from "app/codeCharta/codeCharta.model"

@Injectable()
export class UpdateShowLabelsEffect {
    constructor(private readonly store: Store<CcState>) {}

    updateShowLabels$ = createEffect(() =>
        this.store.select(colorLabelsSelector).pipe(
            withLatestFrom(this.store.select(showMetricLabelNodeValueSelector), this.store.select(showMetricLabelNodeNameSelector)),
            filter(([colorLabels, showMetricLabelNodeValue, showMetricLabelNodeName]) => {
                return this.atLeastOneChecked(colorLabels) !== (showMetricLabelNodeValue || showMetricLabelNodeName)
            }),
            mergeMap(([colorLabels, _showMetricLabelNodeValue, _showMetricLabelNodeName]) => {
                if (this.atLeastOneChecked(colorLabels)) {
                    return [setShowMetricLabelNodeName({ value: true })]
                }
                return [setShowMetricLabelNodeName({ value: false }), setShowMetricLabelNameValue({ value: false })]
            })
        )
    )

    private atLeastOneChecked(colorLabels: ColorLabelOptions): boolean {
        return colorLabels.positive || colorLabels.negative || colorLabels.neutral
    }
}
