import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { createExplorerRulesMock, createExplorerSearchMock } from "../../explorerPorts.mocks"
import { EXPLORER_RULES, ExplorerRules } from "../../explorerRules.port"
import { EXPLORER_SEARCH } from "../../explorerSearch.port"
import { ExplorerSearchActionsComponent } from "./explorerSearchActions.component"

describe("ExplorerSearchActionsComponent", () => {
    let rules: ExplorerRules

    const configureWithEnabledActions = () => {
        rules = createExplorerRulesMock({ isFlattenPatternDisabled$: of(false), isExcludePatternDisabled$: of(false) })
        TestBed.configureTestingModule({
            imports: [ExplorerSearchActionsComponent],
            providers: [
                { provide: EXPLORER_RULES, useValue: rules },
                { provide: EXPLORER_SEARCH, useValue: createExplorerSearchMock({ isPatternEmpty$: of(false) }) }
            ]
        })
    }

    beforeEach(() => {
        configureWithEnabledActions()
    })

    it("should ask the rules port to flatten the current search pattern", async () => {
        // Arrange
        await render(ExplorerSearchActionsComponent)

        // Act
        await userEvent.click(await screen.findByTestId("search-bar-flatten-button"))

        // Assert
        expect(rules.ruleFromSearchPattern).toHaveBeenCalledWith("flatten")
    })

    it("should ask the rules port to exclude the current search pattern", async () => {
        // Arrange
        await render(ExplorerSearchActionsComponent)

        // Act
        await userEvent.click(await screen.findByTestId("search-bar-exclude-button"))

        // Assert
        expect(rules.ruleFromSearchPattern).toHaveBeenCalledWith("exclude")
    })

    it("should disable both actions while the rules port reports the pattern unusable", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [ExplorerSearchActionsComponent],
            providers: [
                { provide: EXPLORER_RULES, useValue: createExplorerRulesMock() },
                { provide: EXPLORER_SEARCH, useValue: createExplorerSearchMock() }
            ]
        })

        // Act
        await render(ExplorerSearchActionsComponent)

        // Assert
        expect(screen.getByTestId<HTMLButtonElement>("search-bar-flatten-button").disabled).toBe(true)
        expect(screen.getByTestId<HTMLButtonElement>("search-bar-exclude-button").disabled).toBe(true)
    })

    it("should hint at entering a pattern while the search is empty", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [ExplorerSearchActionsComponent],
            providers: [
                { provide: EXPLORER_RULES, useValue: createExplorerRulesMock() },
                { provide: EXPLORER_SEARCH, useValue: createExplorerSearchMock() }
            ]
        })

        // Act
        await render(ExplorerSearchActionsComponent)

        // Assert
        expect(screen.getByText("Enter a pattern to enable Flatten/Exclude")).not.toBe(null)
    })
})
