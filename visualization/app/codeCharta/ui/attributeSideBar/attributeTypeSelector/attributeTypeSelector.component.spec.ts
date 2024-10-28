import { TestBed } from "@angular/core/testing"
import { render, screen, fireEvent } from "@testing-library/angular"
import { provideMockStore } from "@ngrx/store/testing"
import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { AttributeTypeValue } from "../../../codeCharta.model"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"

describe("attributeTypeSelector", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AttributeTypeSelectorComponent],
            providers: [
                provideMockStore({
                    selectors: [{ selector: attributeTypesSelector, value: { nodes: { rloc: AttributeTypeValue.absolute } } }]
                })
            ]
        })
    })

    it("should update to median", async () => {
        await render(AttributeTypeSelectorComponent, {
            componentProperties: { metricName: "rloc", metricType: "nodes" }
        })

        const initialDisplayedElement = await screen.getByRole("radio", { checked: true })
        expect(initialDisplayedElement.textContent).toBe("Σ")

        fireEvent.click(screen.getByText("x͂"))
        const medianMenuItem = await screen.getByRole("radio", { checked: true })
        expect(medianMenuItem.textContent).toBe("x͂")
    })

    it("should set aggregation symbol to absolute if attributeType is not available", async () => {
        await render(AttributeTypeSelectorComponent, {
            componentProperties: { metricType: "nodes", metricName: "non-existing" }
        })
        const initialDisplayedElement = await screen.getByRole("radio", { checked: true })
        expect(initialDisplayedElement.textContent).toBe("Σ")
    })
})
