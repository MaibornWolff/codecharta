import { TestBed } from "@angular/core/testing"
import { DomainSelectionStore } from "./domainSelection.store"
import { DomainWordInspectionStore } from "./domainWordInspection.store"

describe("DomainWordInspectionStore", () => {
    const setup = () => {
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({})
        return { inspection: TestBed.inject(DomainWordInspectionStore), selection: TestBed.inject(DomainSelectionStore) }
    }

    it("should inspect no word initially", () => {
        // Arrange
        const { inspection } = setup()

        // Assert
        expect(inspection.inspectedWord()).toBeNull()
    })

    it("should hold the word handed to it", () => {
        // Arrange
        const { inspection } = setup()

        // Act
        inspection.inspect("invoice")

        // Assert
        expect(inspection.inspectedWord()).toBe("invoice")
    })

    it("should stop inspecting when cleared", () => {
        // Arrange
        const { inspection } = setup()
        inspection.inspect("invoice")

        // Act
        inspection.clear()

        // Assert
        expect(inspection.inspectedWord()).toBeNull()
    })

    it("should stop inspecting when another node is selected, because the scope it reported on is gone", () => {
        // Arrange
        const { inspection, selection } = setup()
        inspection.inspect("invoice")

        // Act
        selection.select("/root/billing")

        // Assert
        expect(inspection.inspectedWord()).toBeNull()
    })
})
