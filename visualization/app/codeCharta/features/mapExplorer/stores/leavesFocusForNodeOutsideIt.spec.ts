import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"
import { LeavesFocusForNodeOutsideIt } from "./leavesFocusForNodeOutsideIt"

const FOCUSED_FOLDER = "/root/src"

describe("LeavesFocusForNodeOutsideIt", () => {
    function setup(focusedNodePath: string | undefined) {
        TestBed.configureTestingModule({
            providers: [
                LeavesFocusForNodeOutsideIt,
                provideMockStore({ selectors: [{ selector: currentFocusedNodePathSelector, value: focusedNodePath }] })
            ]
        })
        const dispatchSpy = jest.spyOn(TestBed.inject(MockStore), "dispatch")
        return { arrival: TestBed.inject(LeavesFocusForNodeOutsideIt), dispatchSpy }
    }

    it.each(["/root/src/ui/view.ts", FOCUSED_FOLDER])("should keep the focus when %s lies inside it", nodePath => {
        // Arrange
        const { arrival, dispatchSpy } = setup(FOCUSED_FOLDER)

        // Act
        arrival.receive(nodePath)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it.each(["/root/lib/b.ts", "/root/srcgen/c.ts"])("should clear the focus when %s lies outside it", nodePath => {
        // Arrange
        const { arrival, dispatchSpy } = setup(FOCUSED_FOLDER)

        // Act
        arrival.receive(nodePath)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(unfocusNode())
    })

    it("should have no focus to clear while nothing is focused", () => {
        // Arrange
        const { arrival, dispatchSpy } = setup(undefined)

        // Act
        arrival.receive("/root/lib/b.ts")

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })
})
