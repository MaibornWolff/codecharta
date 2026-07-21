import { firstValueFrom } from "rxjs"
import { ViewReadinessStore } from "./viewReadiness.store"

describe("ViewReadinessStore", () => {
    let store: ViewReadinessStore

    beforeEach(() => {
        store = new ViewReadinessStore()
    })

    it("should start with every view stale, because nothing has rendered yet at boot", () => {
        // Assert
        expect(store.isStale("metrics")).toBe(true)
        expect(store.isStale("domain")).toBe(true)
    })

    it("should mark a single view ready without affecting the other", () => {
        // Act
        store.markReady("domain")

        // Assert
        expect(store.isStale("domain")).toBe(false)
        expect(store.isStale("metrics")).toBe(true)
    })

    it("should mark every view stale when the underlying data changes", () => {
        // Arrange
        store.markReady("domain")
        store.markReady("metrics")

        // Act
        store.markAllStale()

        // Assert
        expect(store.isStale("domain")).toBe(true)
        expect(store.isStale("metrics")).toBe(true)
    })

    it("should emit the staleness of the requested view only", async () => {
        // Arrange
        store.markReady("domain")

        // Act
        const isDomainStale = await firstValueFrom(store.isStale$("domain"))
        const isMetricsStale = await firstValueFrom(store.isStale$("metrics"))

        // Assert
        expect(isDomainStale).toBe(false)
        expect(isMetricsStale).toBe(true)
    })

    it("should not emit again when a view is marked ready twice", async () => {
        // Arrange
        const emissions: boolean[] = []
        store.isStale$("domain").subscribe(isStale => emissions.push(isStale))

        // Act
        store.markReady("domain")
        store.markReady("domain")

        // Assert
        expect(emissions).toEqual([true, false])
    })
})
