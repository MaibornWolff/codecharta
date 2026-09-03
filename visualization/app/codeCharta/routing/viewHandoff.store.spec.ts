import { TestBed } from "@angular/core/testing"
import { ViewHandoffStore } from "./viewHandoff.store"

describe("ViewHandoffStore", () => {
    function setup() {
        TestBed.configureTestingModule({})
        return TestBed.inject(ViewHandoffStore)
    }

    it("should hand the node over to the view it was addressed to", () => {
        // Arrange
        const store = setup()

        // Act
        store.handOverNode("metrics", "/root/src/a.ts")

        // Assert
        expect(store.takeNodeFor("metrics")).toBe("/root/src/a.ts")
    })

    it("should keep the node for its view when another view arrives first", () => {
        // Arrange
        const store = setup()
        store.handOverNode("metrics", "/root/src/a.ts")

        // Act
        const nodePathForDomain = store.takeNodeFor("domain")

        // Assert
        expect(nodePathForDomain).toBeNull()
        expect(store.takeNodeFor("metrics")).toBe("/root/src/a.ts")
    })

    it("should hand a node over once, so returning to the view does not repeat the jump", () => {
        // Arrange
        const store = setup()
        store.handOverNode("metrics", "/root/src/a.ts")
        store.takeNodeFor("metrics")

        // Act & Assert
        expect(store.takeNodeFor("metrics")).toBeNull()
    })

    it("should hand nothing over before a jump was started", () => {
        // Arrange
        const store = setup()

        // Act & Assert
        expect(store.takeNodeFor("metrics")).toBeNull()
    })
})
