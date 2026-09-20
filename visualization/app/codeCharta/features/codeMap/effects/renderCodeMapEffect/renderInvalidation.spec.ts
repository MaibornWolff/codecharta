import { setAreaMetric, setColorMetric, setLabelSize, setScaling } from "../../../../stores/mapState/mapState.write.facade"
import { focusNode } from "../../../../stores/sharedView/sharedView.write.facade"
import { actionsRequiringRerender } from "./actionsRequiringRerender"
import { FULL_INVALIDATION, invalidationForAction, mergeInvalidations, propagate } from "./renderInvalidation"

describe("renderInvalidation", () => {
    describe("invalidationForAction", () => {
        it("should invalidate only labels when a label setting changes", () => {
            // Arrange
            const action = setLabelSize({ value: 2 })

            // Act
            const invalidation = invalidationForAction(action)

            // Assert
            expect(invalidation).toEqual({ geometry: false, colors: false, labels: true, arrows: false })
        })

        it("should invalidate colors and labels when the color metric changes", () => {
            // Arrange
            const action = setColorMetric({ value: "mcc" })

            // Act
            const invalidation = invalidationForAction(action)

            // Assert
            expect(invalidation).toEqual({ geometry: false, colors: true, labels: true, arrows: false })
        })

        it("should invalidate everything when the area metric changes", () => {
            // Arrange
            const action = setAreaMetric({ value: "rloc" })

            // Act
            const invalidation = invalidationForAction(action)

            // Assert
            expect(invalidation).toEqual(FULL_INVALIDATION)
        })

        it("should invalidate everything when the visible node set changes", () => {
            // Arrange
            const action = focusNode({ value: "/root/foo" })

            // Act
            const invalidation = invalidationForAction(action)

            // Assert
            expect(invalidation).toEqual(FULL_INVALIDATION)
        })

        it("should leave the buildings alone when only the map scale changes", () => {
            // Arrange
            const action = setScaling({ value: { x: 1, y: 2, z: 1 } })

            // Act
            const invalidation = invalidationForAction(action)

            // Assert
            expect(invalidation).toEqual({ geometry: false, colors: false, labels: true, arrows: true })
        })

        it("should invalidate everything for an action it does not know", () => {
            // Arrange
            const action = { type: "[Nobody] classified this" }

            // Act
            const invalidation = invalidationForAction(action)

            // Assert
            expect(invalidation).toEqual(FULL_INVALIDATION)
        })

        it("should return a usable invalidation for every action that triggers a rerender", () => {
            // Arrange
            const actionTypes = actionsRequiringRerender.map(({ type }) => type)

            // Act
            const invalidations = actionTypes.map(type => invalidationForAction({ type }))

            // Assert
            expect(invalidations.every(({ geometry, colors, labels, arrows }) => geometry || colors || labels || arrows)).toBe(true)
        })
    })

    describe("propagate", () => {
        it("should make labels and arrows stale when the geometry is stale", () => {
            // Arrange
            const partial = { geometry: true }

            // Act
            const invalidation = propagate(partial)

            // Assert
            expect(invalidation).toEqual(FULL_INVALIDATION)
        })

        it("should make labels stale when the colors are stale", () => {
            // Arrange
            const partial = { colors: true }

            // Act
            const invalidation = propagate(partial)

            // Assert
            expect(invalidation.labels).toBe(true)
        })

        it("should not make arrows stale when only the colors are stale", () => {
            // Arrange
            const partial = { colors: true }

            // Act
            const invalidation = propagate(partial)

            // Assert
            expect(invalidation.arrows).toBe(false)
        })
    })

    describe("mergeInvalidations", () => {
        it("should combine the stages of every invalidation it is given", () => {
            // Arrange
            const invalidations = [
                invalidationForAction(setLabelSize({ value: 2 })),
                invalidationForAction(setColorMetric({ value: "mcc" }))
            ]

            // Act
            const merged = mergeInvalidations(invalidations)

            // Assert
            expect(merged).toEqual({ geometry: false, colors: true, labels: true, arrows: false })
        })
    })
})
