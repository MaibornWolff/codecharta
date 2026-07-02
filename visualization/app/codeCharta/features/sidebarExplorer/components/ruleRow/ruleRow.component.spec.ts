import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BlacklistItem } from "../../../../codeCharta.model"
import { defaultState } from "../../../../state/store/state.manager"
import { removeBlacklistItem } from "../../../../sharedView/sharedView.facade"
import { Store } from "@ngrx/store"
import { RuleRowComponent } from "./ruleRow.component"

const flattenItem: BlacklistItem = { type: "flatten", path: "**/*.spec.ts" }
const manualItem: BlacklistItem = { type: "flatten", path: "apps/foo" }

describe("RuleRowComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RuleRowComponent],
            providers: [provideMockStore({ initialState: defaultState })]
        })
    })

    it("should render the path, count and kind badge", async () => {
        // Arrange & Act
        await render(RuleRowComponent, {
            inputs: { item: flattenItem, affectedCount: 6, kind: "RULE" }
        })

        // Assert
        expect(screen.getByText("**/*.spec.ts")).not.toBe(null)
        expect(screen.getByText("RULE")).not.toBe(null)
        expect(screen.getByText("6")).not.toBe(null)
    })

    it("should render MANUAL badge for concrete paths", async () => {
        // Arrange & Act
        await render(RuleRowComponent, {
            inputs: { item: manualItem, affectedCount: 2, kind: "MANUAL" }
        })

        // Assert
        expect(screen.getByText("MANUAL")).not.toBe(null)
    })

    it("should dispatch removeBlacklistItem when remove button is clicked", async () => {
        // Arrange
        await render(RuleRowComponent, {
            inputs: { item: flattenItem, affectedCount: 6, kind: "RULE" }
        })
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.click(screen.getByTestId("rule-row-remove-button"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(removeBlacklistItem({ item: flattenItem }))
    })
})
