import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BlacklistItem } from "../../../../model/codeCharta.model"
import { createExplorerRulesMock } from "../../explorerPorts.mocks"
import { EXPLORER_RULES, ExplorerRules } from "../../explorerRules.port"
import { RuleRowComponent } from "./ruleRow.component"

const flattenItem: BlacklistItem = { type: "flatten", path: "**/*.spec.ts" }
const manualItem: BlacklistItem = { type: "flatten", path: "apps/foo" }

describe("RuleRowComponent", () => {
    let rules: ExplorerRules

    beforeEach(() => {
        rules = createExplorerRulesMock()
        TestBed.configureTestingModule({
            imports: [RuleRowComponent],
            providers: [{ provide: EXPLORER_RULES, useValue: rules }]
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

    it("should ask the rules port to remove the rule when the remove button is clicked", async () => {
        // Arrange
        await render(RuleRowComponent, {
            inputs: { item: flattenItem, affectedCount: 6, kind: "RULE" }
        })

        // Act
        await userEvent.click(screen.getByTestId("rule-row-remove-button"))

        // Assert
        expect(rules.removeRule).toHaveBeenCalledWith(flattenItem)
    })
})
