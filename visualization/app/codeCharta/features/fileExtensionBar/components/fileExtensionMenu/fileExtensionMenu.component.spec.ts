import { ComponentFixture, TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { ExtensionRulesService } from "../../services/extensionRules.service"
import { FileExtensionMenuComponent, menuPositionAt } from "./fileExtensionMenu.component"

describe("FileExtensionMenuComponent", () => {
    let fixture: ComponentFixture<FileExtensionMenuComponent>
    let closedSpy: jest.Mock

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FileExtensionMenuComponent],
            providers: [{ provide: ExtensionRulesService, useValue: { getIsFlattenedByFileExtension: () => of(false) } }]
        })
        fixture = TestBed.createComponent(FileExtensionMenuComponent)
        fixture.componentRef.setInput("fileExtension", "ts")
        fixture.componentRef.setInput("position", { left: 10, bottom: 20 })
        closedSpy = jest.fn()
        fixture.componentInstance.closed.subscribe(closedSpy)
        document.body.appendChild(fixture.nativeElement)
        fixture.detectChanges()
    })

    afterEach(() => {
        fixture.destroy()
        fixture.nativeElement.remove()
    })

    it("should place itself at the given position", () => {
        // Arrange
        const host: HTMLElement = fixture.nativeElement

        // Act
        const { left, bottom } = host.style

        // Assert
        expect(left).toBe("10px")
        expect(bottom).toBe("20px")
    })

    it("should close when the pointer goes down outside of it", () => {
        // Arrange
        const outside = document.createElement("div")
        document.body.appendChild(outside)

        // Act
        outside.dispatchEvent(new Event("pointerdown", { bubbles: true }))

        // Assert
        expect(closedSpy).toHaveBeenCalledTimes(1)
        outside.remove()
    })

    it("should stay open when the pointer goes down inside of it", () => {
        // Arrange
        const button: HTMLElement = fixture.nativeElement.querySelector("button")

        // Act
        button.dispatchEvent(new Event("pointerdown", { bubbles: true }))

        // Assert
        expect(closedSpy).not.toHaveBeenCalled()
    })

    it.each(["wheel", "resize"])("should close on %s", eventName => {
        // Arrange
        const target = eventName === "resize" ? window : document

        // Act
        target.dispatchEvent(new Event(eventName))

        // Assert
        expect(closedSpy).toHaveBeenCalledTimes(1)
    })
})

describe("menuPositionAt", () => {
    it("should keep the menu inside the viewport near the right edge", () => {
        // Arrange
        const event = new MouseEvent("contextmenu", { clientX: window.innerWidth, clientY: window.innerHeight - 30 })

        // Act
        const position = menuPositionAt(event)

        // Assert
        expect(position).toEqual({ left: window.innerWidth - 192 - 4, bottom: 30 })
    })
})
