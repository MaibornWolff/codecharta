import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { MetricDistribution } from "../../../../util/fileExtension/fileExtensionCalculator"
import { ExtensionRulesService } from "../../services/extensionRules.service"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { FileExtensionOthersListComponent } from "./fileExtensionOthersList.component"

describe("FileExtensionOthersListComponent", () => {
    const others: MetricDistribution[] = [
        { fileExtension: "yml", absoluteMetricValue: 1200, relativeMetricValue: 2.1, color: "#111111" },
        { fileExtension: "sh", absoluteMetricValue: 300, relativeMetricValue: 0.8, color: "#222222" }
    ]
    const highlightService = { highlightExtension: jest.fn(), clearHighlightingOnFileExtensions: jest.fn() }
    const extensionRulesService = {
        getIsFlattenedByFileExtension: jest.fn(() => of(false)),
        flatten: jest.fn(),
        exclude: jest.fn(),
        show: jest.fn()
    }

    async function renderList(showAbsoluteValues = false) {
        const menuOpenChange = jest.fn()
        const { fixture } = await render(FileExtensionOthersListComponent, {
            inputs: { others, showAbsoluteValues, anchor: { right: 8, bottom: 49 } },
            on: { menuOpenChange },
            providers: [
                { provide: HighlightBuildingsByFileExtensionService, useValue: highlightService },
                { provide: ExtensionRulesService, useValue: extensionRulesService }
            ]
        })
        return { menuOpenChange, fixture }
    }

    function rows() {
        return [...document.querySelectorAll<HTMLElement>('[data-test-id="otherExtension"]')]
    }

    afterEach(() => {
        jest.clearAllMocks()
        TestBed.resetTestingModule()
    })

    it("should list every extension of others with its relative value", async () => {
        // Arrange & Act
        await renderList()

        // Assert
        expect(rows().map(row => row.textContent.trim())).toEqual(["yml 2.10%", "sh 0.80%"])
    })

    it("should show absolute values when the bar shows absolute values", async () => {
        // Arrange & Act
        await renderList(true)

        // Assert
        expect(screen.getByText("yml 1,200")).toBeTruthy()
    })

    it("should sit above the segment it belongs to", async () => {
        // Arrange & Act
        await renderList()

        // Assert
        const list = document.querySelector<HTMLElement>('[data-test-id="othersList"]')
        expect(list.style.right).toBe("8px")
        expect(list.style.bottom).toBe("49px")
    })

    it("should highlight only the hovered extension and clear it on leave", async () => {
        // Arrange
        await renderList()
        const row = screen.getByText("sh 0.80%").parentElement

        // Act
        row.dispatchEvent(new MouseEvent("mouseenter"))
        row.dispatchEvent(new MouseEvent("mouseleave"))

        // Assert
        expect(highlightService.highlightExtension).toHaveBeenCalledWith("sh")
        expect(highlightService.clearHighlightingOnFileExtensions).toHaveBeenCalled()
    })

    it("should open the context menu for the right-clicked extension and report it open", async () => {
        // Arrange
        const { menuOpenChange, fixture } = await renderList()

        // Act
        rows()[0].dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }))
        fixture.detectChanges()
        screen.getByText("Flatten").click()
        fixture.detectChanges()

        // Assert
        expect(extensionRulesService.flatten).toHaveBeenCalledWith("yml")
        expect(menuOpenChange.mock.calls).toEqual([[true], [false]])
        expect(screen.queryByText("Flatten")).toBeNull()
    })
})
