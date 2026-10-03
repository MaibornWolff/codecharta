import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { STATE } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"
import { SharedFocusStore } from "./sharedFocus.store"

describe("SharedFocusStore", () => {
    function setup(focusedNodePath: string[]) {
        const state: CcState = { ...STATE, sharedView: { ...STATE.sharedView, focusedNodePath } }
        TestBed.configureTestingModule({ providers: [provideMockStore({ initialState: state })] })
    }

    it("should read the folder the views are focused on", () => {
        // Arrange
        setup(["/root/billing"])

        // Act
        const focusStore = TestBed.inject(SharedFocusStore)

        // Assert
        expect(focusStore.focusedNodePath()).toBe("/root/billing")
        expect(focusStore.isFocused()).toBe(true)
    })

    it("should read no focus while nothing is focused", () => {
        // Arrange
        setup([])

        // Act
        const focusStore = TestBed.inject(SharedFocusStore)

        // Assert
        expect(focusStore.isFocused()).toBe(false)
    })

    it("should let go of the focus", () => {
        // Arrange
        setup(["/root/billing"])
        const dispatch = jest.spyOn(TestBed.inject(MockStore), "dispatch")

        // Act
        TestBed.inject(SharedFocusStore).unfocus()

        // Assert
        expect(dispatch).toHaveBeenCalledWith(unfocusNode())
    })
})
