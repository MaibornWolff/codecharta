import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { AttributeTypes, AttributeTypeValue, CcState } from "../../../codeCharta.model"
import { updateAttributeType } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"
import { MatButtonToggleGroup, MatButtonToggle } from "@angular/material/button-toggle"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-attribute-type-selector",
    templateUrl: "./attributeTypeSelector.component.html",
    standalone: true,
    imports: [MatButtonToggleGroup, MatButtonToggle, AsyncPipe]
})
export class AttributeTypeSelectorComponent {
    @Input() metricName: string
    @Input() metricType: keyof AttributeTypes

    attributeTypes$ = this.store.select(attributeTypesSelector)

    constructor(private readonly store: Store<CcState>) {}

    setToAbsolute() {
        this.setAttributeType(AttributeTypeValue.absolute)
    }

    setToRelative() {
        this.setAttributeType(AttributeTypeValue.relative)
    }

    private setAttributeType(attributeTypeValue: AttributeTypeValue) {
        this.store.dispatch(
            updateAttributeType({
                category: this.metricType,
                name: this.metricName,
                attributeType: attributeTypeValue
            })
        )
    }
}
