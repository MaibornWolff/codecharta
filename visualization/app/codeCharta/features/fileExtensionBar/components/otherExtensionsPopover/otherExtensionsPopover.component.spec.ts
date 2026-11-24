import { ComponentFixture, TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { MetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { ExtensionRulesService } from "../../services/extensionRules.service"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { OtherExtensionsPopoverComponent } from "./otherExtensionsPopover.component"

describe("OtherExtensionsPopoverComponent", () => {
    let fixture: ComponentFixture<OtherExtensionsPopoverComponent>
    let extensionRulesService: { flatten: jest.Mock; exclude: jest.Mock; show: jest.Mock; getIsFlattenedByFileExtension: jest.Mock }
    let highlightService: { highlightExtension: jest.Mock; clearHighlightingOnFileExtensions: jest.Mock }
    let menuOpenChanges: boolean[]

    const total: MetricDistribution = {
        fileExtension: OTHER_EXTENSION,
        absoluteMetricValue: 45,
        relativeMetricValue: 4.5,
        color: "#676867"
    }
    const items: MetricDistribution[] = [
        { fileExtension: "yml", absoluteMetricValue: 21, relativeMetricValue: 2.1, color: "#111111" },
        { fileExtension: NO_EXTENSION, absoluteMetricValue: 14, relativeMetricValue: 1.4, color: "#676867" }
    ]

    beforeEach(() => {
        extensionRulesService = {
            flatten: jest.fn(),
            exclude: jest.fn(),
            show: jest.fn(),
            getIsFlattenedByFileExtension: jest.fn(() => of(false))
        }
        highlightService = { highlightExtension: jest.fn(), clearHighlightingOnFileExtensions: jest.fn() }
        TestBed.configureTestingModule({
            imports: [OtherExtensionsPopoverComponent],
            providers: [
                { provide: ExtensionRulesService, useValue: extensionRulesService },
                { provide: HighlightBuildingsByFileExtensionService, useValue: highlightService }
            ]
        })
        fixture = TestBed.createComponent(OtherExtensionsPopoverComponent)
        fixture.componentRef.setInput("total", total)
        fixture.componentRef.setInput("items", items)
        fixture.componentRef.setInput("showAbsoluteValues", false)
        fixture.componentRef.setInput("anchor", { right: 8, bottom: 49 })
        menuOpenChanges = []
        fixture.componentInstance.menuOpenChange.subscribe(isOpen => menuOpenChanges.push(isOpen))
        document.body.appendChild(fixture.nativeElement)
        fixture.detectChanges()
    })

    afterEach(() => {
        fixture.destroy()
        fixture.nativeElement.remove()
    })

    function rows(): HTMLElement[] {
        return [...fixture.nativeElement.querySelectorAll('[data-test-id="otherExtensionRow"]')]
    }

    function allOthersRow(): HTMLElement {
        return fixture.nativeElement.querySelector('[data-test-id="allOthersRow"]')
    }

    function rightClick(element: HTMLElement) {
        element.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 50, clientY: 500 }))
        fixture.detectChanges()
    }

    function clickMenuButton(dataTestId: string) {
        fixture.nativeElement.querySelector(`[data-test-id="${dataTestId}"]`).click()
        fixture.detectChanges()
    }

    it("should list every grouped extension with its relative value", () => {
        // Arrange
        const expectedTexts = ["yml 2.10%", "None 1.40%"]

        // Act
        const texts = rows().map(row =>
            [...row.querySelectorAll("span")]
                .map(cell => cell.textContent.trim())
                .join(" ")
                .trim()
        )

        // Assert
        expect(texts).toEqual(expectedTexts)
    })

    it("should show absolute values when the bar shows absolute values", () => {
        // Arrange
        fixture.componentRef.setInput("showAbsoluteValues", true)

        // Act
        fixture.detectChanges()

        // Assert
        expect(allOthersRow().textContent).toContain("45")
        expect(rows()[0].textContent).toContain("21")
    })

    it("should sit right above the segment it is anchored to", () => {
        // Arrange
        const host: HTMLElement = fixture.nativeElement

        // Act
        const { right, bottom } = host.style

        // Assert
        expect(right).toBe("8px")
        expect(bottom).toBe("49px")
    })

    it("should highlight the buildings of a hovered row and clear them on leave", () => {
        // Arrange
        const ymlRow = rows()[0]

        // Act
        ymlRow.dispatchEvent(new MouseEvent("mouseover"))
        ymlRow.dispatchEvent(new MouseEvent("mouseleave"))

        // Assert
        expect(highlightService.highlightExtension).toHaveBeenCalledWith("yml")
        expect(highlightService.clearHighlightingOnFileExtensions).toHaveBeenCalled()
    })

    it("should highlight every grouped extension when 'All others' is hovered", () => {
        // Arrange
        const row = allOthersRow()

        // Act
        row.dispatchEvent(new MouseEvent("mouseover"))

        // Assert
        expect(highlightService.highlightExtension).toHaveBeenCalledWith(OTHER_EXTENSION)
    })

    it.each([
        ["flattenBuilding", "flatten"],
        ["excludeBuilding", "exclude"]
    ] as const)("should %s only the right-clicked extension", (dataTestId, action) => {
        // Arrange
        rightClick(rows()[0])

        // Act
        clickMenuButton(dataTestId)

        // Assert
        expect(extensionRulesService[action]).toHaveBeenCalledWith("yml")
        expect(fixture.nativeElement.querySelector("cc-file-extension-menu")).toBeNull()
        expect(menuOpenChanges).toEqual([true, false])
    })

    it("should offer 'Show' for a right-clicked extension that is flattened", () => {
        // Arrange
        extensionRulesService.getIsFlattenedByFileExtension.mockReturnValue(of(true))
        rightClick(rows()[0])

        // Act
        clickMenuButton("showBuilding")

        // Assert
        expect(extensionRulesService.show).toHaveBeenCalledWith("yml")
    })

    it("should apply the action to all grouped extensions from the 'All others' row", () => {
        // Arrange
        rightClick(allOthersRow())

        // Act
        clickMenuButton("excludeBuilding")

        // Assert
        expect(extensionRulesService.exclude).toHaveBeenCalledWith(OTHER_EXTENSION)
    })

    it("should offer no actions for files without an extension", () => {
        // Arrange
        const noneRow = rows()[1]

        // Act
        rightClick(noneRow)

        // Assert
        expect(fixture.nativeElement.querySelector("cc-file-extension-menu")).toBeNull()
        expect(menuOpenChanges).toEqual([])
    })
})
