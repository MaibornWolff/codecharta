import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { defaultState } from "../../../../state/store/state.manager"
import { excludeRulesWithCountSelector, flattenRulesWithCountSelector } from "../../selectors/sidebarExplorer.selectors"
import { RulesPopoverComponent } from "./rulesPopover.component"

const FLATTEN_RULES = [
    { item: { type: "flatten", path: "**/*.spec.ts" }, affectedCount: 4, kind: "RULE" as const },
    { item: { type: "flatten", path: "apps/foo" }, affectedCount: 1, kind: "MANUAL" as const }
]

const EXCLUDE_RULES = [{ item: { type: "exclude", path: "node_modules" }, affectedCount: 5, kind: "MANUAL" as const }]

describe("RulesPopoverComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RulesPopoverComponent],
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: flattenRulesWithCountSelector, value: FLATTEN_RULES },
                        { selector: excludeRulesWithCountSelector, value: EXCLUDE_RULES }
                    ]
                })
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
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: flattenRulesWithCountSelector, value: [] }]
                })
            ]
        })

        // Act
        await render(RulesPopoverComponent, {
            inputs: { kind: "flatten", popoverId: "explorer-flatten-rules", anchorName: "explorer-flat-chip" }
        })

        // Assert
        expect(screen.getByText("No rules")).not.toBe(null)
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
