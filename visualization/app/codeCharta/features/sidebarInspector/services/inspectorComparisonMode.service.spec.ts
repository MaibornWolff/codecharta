import { TestBed } from "@angular/core/testing"
import { InspectorComparisonModeService } from "./inspectorComparisonMode.service"

describe("InspectorComparisonModeService", () => {
    let service: InspectorComparisonModeService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(InspectorComparisonModeService)
    })

    it("should default to comparing against the whole map", () => {
        // Arrange, Act & Assert
        expect(service.comparisonMode()).toBe("map")
    })

    it("should switch the comparison mode", () => {
        // Act
        service.setComparisonMode("range")

        // Assert
        expect(service.comparisonMode()).toBe("range")
    })
})
