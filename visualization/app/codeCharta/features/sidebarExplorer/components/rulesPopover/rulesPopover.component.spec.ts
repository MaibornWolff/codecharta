import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { EXPLORER_COUNTS } from "../../explorerCounts.port"
import { EXPLORER_METRIC_RULES } from "../../explorerMetricRules.port"
import { createExplorerMetricRulesMock, createExplorerRulesMock } from "../../explorerPorts.mocks"
import { EXPLORER_RULES, RuleWithCount } from "../../explorerRules.port"
import { RulesPopoverComponent } from "./rulesPopover.component"

const FLATTEN_RULES: RuleWithCount[] = [
    {
        id: "flatten/**/*.spec.ts",
        label: "**/*.spec.ts",
        affectedCount: 4,
        kind: "RULE",
        item: { type: "flatten", path: "**/*.spec.ts" }
    },
    { id: "flatten/apps/foo", label: "apps/foo", affectedCount: 1, kind: "MANUAL", item: { type: "flatten", path: "apps/foo" } }
]

const EXCLUDE_RULES: RuleWithCount[] = [
    {
        id: "exclude/node_modules",
        label: "node_modules",
        affectedCount: 5,
        kind: "MANUAL",
        item: { type: "exclude", path: "node_modules" }
    }
]

describe("RulesPopoverComponent", () => {
    let rules: ReturnType<typeof createExplorerRulesMock>

    beforeEach(() => {
        // jsdom stubs for native <dialog>
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
        rules = createExplorerRulesMock({ flattenRules$: of(FLATTEN_RULES), excludeRules$: of(EXCLUDE_RULES) })
        TestBed.configureTestingModule({
            imports: [RulesPopoverComponent],
            providers: [
                { provide: EXPLORER_RULES, useValue: rules },
                { provide: EXPLORER_COUNTS, useValue: { counts$: of({ shown: 100, flattened: 5, hidden: 9, noArea: 0 }) } }
            ]
        })
    })

    it("should display flattening rules title for flatten kind", async () => {
        // Arrange & Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(screen.getByText("Flattening Rules")).not.toBe(null)
    })

    it("should display hidden rules title for exclude kind", async () => {
        // Arrange & Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "exclude", popoverId: "explorer-hidden-rules", anchorName: "explorer-hidden-chip" }
        })

        // Assert
        expect(screen.getByText("Hidden Rules")).not.toBe(null)
    })

    it("should render one row per flatten rule", async () => {
        // Arrange & Act
        const { container } = await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(container.querySelectorAll("cc-rule-row").length).toBe(2)
    })

    it("should render one row per exclude rule", async () => {
        // Arrange & Act
        const { container } = await render(RulesPopoverComponent, {
            inputs: { kind: "exclude", popoverId: "explorer-hidden-rules", anchorName: "explorer-hidden-chip" }
        })

        // Assert
        expect(container.querySelectorAll("cc-rule-row").length).toBe(1)
    })

    it("should render no-rules placeholder when there are zero items", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [RulesPopoverComponent],
            providers: [{ provide: EXPLORER_RULES, useValue: createExplorerRulesMock() }]
        })

        // Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(screen.getByText("No rules")).not.toBe(null)
    })

    it("should offer to clear the list, counting the rules it would remove", async () => {
        // Arrange & Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(screen.getByTestId("rules-popover-clear-button").textContent).toContain("Clear all 2 rules")
    })

    it("should not offer to clear a list that has no rules", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [RulesPopoverComponent],
            providers: [{ provide: EXPLORER_RULES, useValue: createExplorerRulesMock() }]
        })

        // Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(screen.queryByTestId("rules-popover-clear-button")).toBe(null)
    })

    it("should name the one rule in the singular", async () => {
        // Arrange & Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "exclude", popoverId: "explorer-hidden-rules", anchorName: "explorer-hidden-chip" }
        })

        // Assert
        expect(screen.getByTestId("rules-popover-clear-button").textContent).toContain("Clear 1 rule")
    })

    it("should ask before clearing, saying how many files come back", async () => {
        // Arrange
        await render(RulesPopoverComponent, {
            inputs: { kind: "exclude", popoverId: "explorer-hidden-rules", anchorName: "explorer-hidden-chip" }
        })

        // Act
        await userEvent.click(screen.getByTestId("rules-popover-clear-button"))

        // Assert
        expect(screen.getByText("Confirm clear hide rules")).not.toBe(null)
        expect(screen.getByText("The 1 hide rule is removed and 9 files are back on the map.")).not.toBe(null)
    })

    it("should clear the list once the clearing is confirmed", async () => {
        // Arrange
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })
        await userEvent.click(screen.getByTestId("rules-popover-clear-button"))

        // Act
        await userEvent.click(screen.getByTestId("confirm-dialog-yes"))

        // Assert
        expect(rules.clearRules).toHaveBeenCalledWith("flatten")
    })

    it("should clear nothing when the clearing is declined", async () => {
        // Arrange
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })
        await userEvent.click(screen.getByTestId("rules-popover-clear-button"))

        // Act
        await userEvent.click(screen.getByTestId("confirm-dialog-no"))

        // Assert
        expect(rules.clearRules).not.toHaveBeenCalled()
    })

    it("should offer the metric editor when the view provides one", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [RulesPopoverComponent],
            providers: [
                { provide: EXPLORER_RULES, useValue: createExplorerRulesMock({ flattenRules$: of(FLATTEN_RULES) }) },
                { provide: EXPLORER_METRIC_RULES, useValue: createExplorerMetricRulesMock() }
            ]
        })

        // Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(screen.getByTestId("rules-popover-add-metric-rule-button")).not.toBe(null)
    })

    it("should describe the affected files generically when no count is available", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [RulesPopoverComponent],
            providers: [{ provide: EXPLORER_RULES, useValue: createExplorerRulesMock({ flattenRules$: of(FLATTEN_RULES) }) }]
        })
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Act
        await userEvent.click(screen.getByTestId("rules-popover-clear-button"))

        // Assert
        expect(screen.getByText(/every file they affect is drawn at full height again/)).not.toBe(null)
    })

    it("should name a single affected file in the singular", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [RulesPopoverComponent],
            providers: [
                { provide: EXPLORER_RULES, useValue: createExplorerRulesMock({ flattenRules$: of(FLATTEN_RULES) }) },
                { provide: EXPLORER_COUNTS, useValue: { counts$: of({ shown: 3, flattened: 1, hidden: 0, noArea: 0 }) } }
            ]
        })
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Act
        await userEvent.click(screen.getByTestId("rules-popover-clear-button"))

        // Assert
        expect(screen.getByText(/1 file is drawn at full height again/)).not.toBe(null)
    })

    it("should render a close button", async () => {
        // Arrange & Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(screen.getByTestId("rules-popover-close-button")).not.toBe(null)
    })
})
