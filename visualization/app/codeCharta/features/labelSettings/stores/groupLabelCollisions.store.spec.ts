import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { GroupLabelCollisionsStore } from "./groupLabelCollisions.store"
import { groupLabelCollisionsSelector } from "../selectors/labelSettings.selectors"
import { setGroupLabelCollisions } from "../../../state/store/appSettings/groupLabelCollisions/groupLabelCollisions.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("GroupLabelCollisionsStore", () => {
    let store: GroupLabelCollisionsStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GroupLabelCollisionsStore,
                provideMockStore({ selectors: [{ selector: groupLabelCollisionsSelector, value: true }] })
            ]
        })

        store = TestBed.inject(GroupLabelCollisionsStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("groupLabelCollisions$", () => {
        it("should emit true from selector", done => {
            // Arrange
            mockStore.overrideSelector(groupLabelCollisionsSelector, true)
            mockStore.refreshState()

            // Act & Assert
            store.groupLabelCollisions$.subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should emit false when selector returns false", done => {
            // Arrange
            mockStore.overrideSelector(groupLabelCollisionsSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.groupLabelCollisions$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setGroupLabelCollisions", () => {
        it("should dispatch setGroupLabelCollisions action with true", async () => {
            // Arrange & Act
            store.setGroupLabelCollisions(true)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setGroupLabelCollisions({ value: true }))
        })

        it("should dispatch setGroupLabelCollisions action with false", async () => {
            // Arrange & Act
            store.setGroupLabelCollisions(false)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setGroupLabelCollisions({ value: false }))
        })
    })
})
