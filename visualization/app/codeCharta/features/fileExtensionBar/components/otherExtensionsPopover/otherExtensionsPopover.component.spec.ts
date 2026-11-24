import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MetricDistribution, NO_EXTENSION, OTHER_EXTENSION } from "../../../../util/fileExtension/fileExtensionCalculator"
import { HighlightBuildingsByFileExtensionService } from "../../services/highlightBuildingsByFileExtension.service"
import { ExtensionMenuRequest } from "../fileExtensionMenu/fileExtensionMenu.component"
import { OtherExtensionsPopoverComponent } from "./otherExtensionsPopover.component"

describe("OtherExtensionsPopoverComponent", () => {
    let fixture: ComponentFixture<OtherExtensionsPopoverComponent>
    let highlightService: { highlightExtension: jest.Mock; clearHighlightingOnFileExtensions: jest.Mock }
    let menuRequests: ExtensionMenuRequest[]

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
        highlightService = { highlightExtension: jest.fn(), clearHighlightingOnFileExtensions: jest.fn() }
        TestBed.configureTestingModule({
            imports: [OtherExtensionsPopoverComponent],
            providers: [{ provide: HighlightBuildingsByFileExtensionService, useValue: highlightService }]
        })
        fixture = TestBed.createComponent(OtherExtensionsPopoverComponent)
        fixture.componentRef.setInput("total", total)
        fixture.componentRef.setInput("items", items)
        fixture.componentRef.setInput("showAbsoluteValues", false)
        fixture.componentRef.setInput("anchor", { right: 8, bottom: 49 })
        menuRequests = []
        fixture.componentInstance.menuRequested.subscribe(request => menuRequests.push(request))
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

    it("should ask for the menu of the right-clicked extension where the pointer is", () => {
        // Arrange
        const ymlRow = rows()[0]

        // Act
        rightClick(ymlRow)

        // Assert
        expect(menuRequests).toEqual([{ fileExtension: "yml", position: { left: 50, bottom: window.innerHeight - 500 } }])
    })

    it("should ask for the menu of all grouped extensions from the 'All others' row", () => {
        // Arrange
        const row = allOthersRow()

        // Act
        rightClick(row)

        // Assert
        expect(menuRequests.map(request => request.fileExtension)).toEqual([OTHER_EXTENSION])
    })

    it("should offer no actions for files without an extension", () => {
        // Arrange
        const noneRow = rows()[1]

        // Act
        rightClick(noneRow)

        // Assert
        expect(menuRequests).toEqual([])
    })
})
