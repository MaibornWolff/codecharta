import { TestBed } from "@angular/core/testing"
import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/angular"

import { AttributeTypeSelectorModule } from "./attributeTypeSelector.module"
import { Store } from "../../../state/store/store"
import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { AttributeTypeValue } from "../../../codeCharta.model"
import { setAttributeTypes } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.actions"

describe("attributeTypeSelector", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AttributeTypeSelectorModule]
		})

		Store["initialize"]()
		Store.store.dispatch(
			setAttributeTypes({
				nodes: { rloc: AttributeTypeValue.absolute }
			})
		)
	})

	it("should update to median", async () => {
		await render(AttributeTypeSelectorComponent, {
			componentProperties: { metricName: "rloc" },
			excludeComponentDeclaration: true
		})

		const initialDisplayedElement = await screen.findByText("Σ")
		expect(initialDisplayedElement).toBeTruthy()

		fireEvent.click(initialDisplayedElement)
		const medianMenuItem = await screen.findByText("x͂ Median")
		expect(medianMenuItem).toBeTruthy()

		fireEvent.click(medianMenuItem)
		await waitForElementToBeRemoved(() => {
			const medianMenuItem = screen.queryByText("x͂ Median")
			return medianMenuItem
		})
		const updatedDisplayedElement = await screen.findByText("x͂")
		expect(updatedDisplayedElement).toBeTruthy()
	})

	it("should set aggregation symbol to absolute if attributeType is not available", async () => {
		await render(AttributeTypeSelectorComponent, {
			componentProperties: { metricName: "non-existing" },
			excludeComponentDeclaration: true
		})
		expect(await screen.findByText("Σ")).toBeTruthy()
	})
})
