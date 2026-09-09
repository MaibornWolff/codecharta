import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { createExplorerRulesMock } from "../../explorerPorts.mocks"
import { EXPLORER_RULES, ExplorerRules, RuleWithCount } from "../../explorerRules.port"
import { RuleRowComponent } from "./ruleRow.component"

const patternRule: RuleWithCount = {
    id: "flatten/**/*.spec.ts",
    label: "**/*.spec.ts",
    affectedCount: 6,
    kind: "RULE",
    item: { type: "flatten", path: "**/*.spec.ts" }
}
const manualRule: RuleWithCount = {
    id: "flatten/apps/foo",
    label: "apps/foo",
    affectedCount: 2,
    kind: "MANUAL",
    item: { type: "flatten", path: "apps/foo" }
}

describe("RuleRowComponent", () => {
    let rules: ExplorerRules

    beforeEach(() => {
        rules = createExplorerRulesMock()
        TestBed.configureTestingModule({
            imports: [RuleRowComponent],
            providers: [{ provide: EXPLORER_RULES, useValue: rules }]
        })
    })

    it("should render the label, count and kind badge", async () => {
        // Arrange & Act
        await render(RuleRowComponent, {
            inputs: { rule: patternRule }
        })

        // Assert
        expect(screen.getByText("**/*.spec.ts")).not.toBe(null)
        expect(screen.getByText("RULE")).not.toBe(null)
        expect(screen.getByText("6")).not.toBe(null)
    })

    it("should render MANUAL badge for concrete paths", async () => {
        // Arrange & Act
        await render(RuleRowComponent, {
            inputs: { rule: manualRule }
        })

        // Assert
        expect(screen.getByText("MANUAL")).not.toBe(null)
    })

    it("should ask the rules port to remove the rule when the remove button is clicked", async () => {
        // Arrange
        await render(RuleRowComponent, {
            inputs: { rule: patternRule }
        })

        // Act
        await userEvent.click(screen.getByTestId("rule-row-remove-button"))

        // Assert
        expect(rules.removeRule).toHaveBeenCalledWith(patternRule)
    })
})
