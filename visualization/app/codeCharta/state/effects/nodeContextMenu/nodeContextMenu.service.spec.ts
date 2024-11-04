import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { fireEvent } from "@testing-library/angular"
import { MaterialModule } from "../../../../material/material.module"
import { NodeContextMenuService } from "./nodeContextMenu.service"
import { NodeContextMenuCardModule } from "./nodeContextMenuCard/nodeContextMenuCard.module"
import { Store } from "@ngrx/store"

describe("nodeContextMenuService", () => {
    let mockedWheelTargetElement

    beforeEach(async () => {
        mockedWheelTargetElement = { addEventListener: jest.fn(), removeEventListener: jest.fn() }
        jest.spyOn(document, "getElementById").mockImplementation(() => mockedWheelTargetElement)

        TestBed.configureTestingModule({
            imports: [MaterialModule, NodeContextMenuCardModule],
            providers: [NodeContextMenuService, { provide: Store, useValue: { dispatch: jest.fn() } }]
        })
        await TestBed.inject(ApplicationInitStatus).donePromise
    })

    it("should close on document click", () => {
        const nodeContextMenu = TestBed.inject(NodeContextMenuService)
        const closeSpy = jest.spyOn(nodeContextMenu, "close")
        nodeContextMenu.open(10, 10)

        document.dispatchEvent(new MouseEvent("click"))

        expect(closeSpy).toHaveBeenCalled()
    })

    it("should not close when clicking within (its) color picker", () => {
        const nodeContextMenu = TestBed.inject(NodeContextMenuService)
        const closeSpy = jest.spyOn(nodeContextMenu, "close")
        nodeContextMenu.open(10, 10)

        const mockedMouseEvent = { composedPath: () => [{ nodeName: "COLOR-CHROME" }] } as unknown as MouseEvent
        nodeContextMenu["onLeftClickHideNodeContextMenu"](mockedMouseEvent)

        expect(closeSpy).not.toHaveBeenCalled()
    })

    it("should not close when opening its color picker", () => {
        const nodeContextMenu = TestBed.inject(NodeContextMenuService)
        const closeSpy = jest.spyOn(nodeContextMenu, "close")
        nodeContextMenu.open(10, 10)

        const mockedMouseEvent = { composedPath: () => [{ nodeName: "CC-COLOR-PICKER" }] } as unknown as MouseEvent
        nodeContextMenu["onLeftClickHideNodeContextMenu"](mockedMouseEvent)

        expect(closeSpy).not.toHaveBeenCalled()
    })

    it("should remove all listeners when closing", () => {
        const documentRemoveEventListenerSpy = jest.spyOn(document, "removeEventListener")
        const nodeContextMenu = TestBed.inject(NodeContextMenuService)

        nodeContextMenu.close()

        expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith("click", nodeContextMenu["onLeftClickHideNodeContextMenu"], true)
        expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith("mousedown", nodeContextMenu["onRightClickHideNodeContextMenu"], true)
        expect(mockedWheelTargetElement.removeEventListener).toHaveBeenCalledWith("wheel", nodeContextMenu.close, true)
    })

    it("should prevent default browser context menu to open", () => {
        const nodeContextMenu = TestBed.inject(NodeContextMenuService)
        nodeContextMenu.open(10, 10)
        let wasDefaultContextMenuPrevented
        document.addEventListener("contextmenu", event => {
            wasDefaultContextMenuPrevented = event.defaultPrevented
        })
        fireEvent.contextMenu(nodeContextMenu["overlayReference"].overlayElement)
        expect(wasDefaultContextMenuPrevented).toBe(true)
    })

    it("should not dispose with only one opened panel", () => {
        const nodeContextMenu = TestBed.inject(NodeContextMenuService)
        const resetSpy = jest.spyOn(nodeContextMenu, "resetOverlay")

        nodeContextMenu.open(10, 10)

        expect(resetSpy).not.toHaveBeenCalled()
    })

    it("should not open multiple times when open is clicked twice, disposing previous reference", () => {
        const nodeContextMenu = TestBed.inject(NodeContextMenuService)
        nodeContextMenu.open(10, 10)

        expect(nodeContextMenu["overlayReference"]).not.toBe(null)

        const resetSpy = jest.spyOn(nodeContextMenu, "resetOverlay")

        nodeContextMenu.open(10, 11)

        expect(resetSpy).toHaveBeenCalled()
    })
})
