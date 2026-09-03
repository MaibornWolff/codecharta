import { TestBed } from "@angular/core/testing"
import { DomainWordInspectionStore } from "./domainWordInspection.store"

describe("DomainWordInspectionStore", () => {
    const setup = () => {
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({})
        return { inspection: TestBed.inject(DomainWordInspectionStore) }
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

    it("should inspect a toggled word", () => {
        // Arrange
        const { inspection } = setup()

        // Act
        inspection.toggle("invoice")

        // Assert
        expect(inspection.inspectedWord()).toBe("invoice")
    })

    it("should stop inspecting when the inspected word is toggled again", () => {
        // Arrange
        const { inspection } = setup()
        inspection.inspect("invoice")

        // Act
        inspection.toggle("invoice")

        // Assert
        expect(inspection.inspectedWord()).toBeNull()
    })
})
