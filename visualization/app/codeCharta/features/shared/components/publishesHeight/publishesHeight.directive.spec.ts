import { Component, ElementRef } from "@angular/core"
import { render } from "@testing-library/angular"
import { CSS_VARIABLE_HOST, provideViewScopedCssVariables } from "../../cssVariableHost"
import { HEIGHT_CSS_VARIABLE, PublishesHeightDirective } from "./publishesHeight.directive"

let resizeCallback: (() => void) | undefined
class ResizeObserverMock {
    constructor(callback: () => void) {
        resizeCallback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
}

const CSS_VARIABLE = "--cc-test-bar-height"

let measuredHeight = 0

@Component({
    selector: "cc-publishes-height-host",
    template: `<div ccPublishesHeight></div>`,
    imports: [PublishesHeightDirective],
    providers: [{ provide: HEIGHT_CSS_VARIABLE, useValue: CSS_VARIABLE }]
})
class HostComponent {}

@Component({
    selector: "cc-view-scoped-host",
    template: `<div ccPublishesHeight></div>`,
    imports: [PublishesHeightDirective],
    providers: [{ provide: HEIGHT_CSS_VARIABLE, useValue: CSS_VARIABLE }, provideViewScopedCssVariables()]
})
class ViewScopedHostComponent {
    constructor(readonly elementReference: ElementRef<HTMLElement>) {}
}

describe("PublishesHeightDirective", () => {
    beforeEach(() => {
        resizeCallback = undefined
        measuredHeight = 28
        window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
        jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ height: measuredHeight }) as DOMRect)
        document.documentElement.style.removeProperty(CSS_VARIABLE)
    })

    afterEach(() => {
        jest.restoreAllMocks()
        document.documentElement.style.removeProperty(CSS_VARIABLE)
    })

    const publishedHeight = () => document.documentElement.style.getPropertyValue(CSS_VARIABLE)

    it("should publish the measured host height to the css variable on init", async () => {
        // Arrange & Act
        await render(HostComponent)

        // Assert
        expect(publishedHeight()).toBe("28px")
    })

    it("should not clobber the css variable when the measured element is detached from the DOM", async () => {
        // Arrange
        const { fixture } = await render(HostComponent)
        const measuredElement = fixture.nativeElement.querySelector("[ccPublishesHeight]") as HTMLElement
        expect(publishedHeight()).toBe("28px")

        // Act: a kept-alive view is removed from the DOM, so its ResizeObserver fires with height 0
        measuredElement.remove()
        measuredHeight = 0
        resizeCallback?.()

        // Assert: the previously published height is preserved for the still-active view below
        expect(publishedHeight()).toBe("28px")
    })

    it("should publish onto the view host instead of the document when the view scopes its css variables", async () => {
        // Arrange & Act
        const { fixture } = await render(ViewScopedHostComponent)

        // Assert
        const viewHost = fixture.componentInstance.elementReference.nativeElement
        expect(viewHost.style.getPropertyValue(CSS_VARIABLE)).toBe("28px")
        expect(publishedHeight()).toBe("")
    })

    it("should default the css variable host to the document element", async () => {
        // Arrange & Act
        const { fixture } = await render(HostComponent)

        // Assert
        expect(fixture.debugElement.injector.get(CSS_VARIABLE_HOST)).toBe(document.documentElement)
    })

    it("should republish the real height when the element is reattached", async () => {
        // Arrange
        const { fixture } = await render(HostComponent)
        const host = fixture.nativeElement as HTMLElement
        const measuredElement = host.querySelector("[ccPublishesHeight]") as HTMLElement
        measuredElement.remove()
        measuredHeight = 0
        resizeCallback?.()

        // Act: the view is reattached and the observer fires with the restored size
        host.appendChild(measuredElement)
        measuredHeight = 40
        resizeCallback?.()

        // Assert
        expect(publishedHeight()).toBe("40px")
    })
})
