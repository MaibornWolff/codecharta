import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { LinkColorHeightButtonComponent } from "./linkColorHeightButton.component"

describe("LinkColorHeightButtonComponent", () => {
    async function setup(isLinked: boolean) {
        return render(LinkColorHeightButtonComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: isColorMetricLinkedToHeightMetricSelector, value: isLinked }]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: () => [],
                        sortVisibleNodesByHeightDescending: () => [],
                        colorCategoryCounts$: of({ positive: 0, neutral: 0, negative: 0 })
                    }
                }
            ]
        })
    }

    it("should dispatch the link toggle action on click", async () => {
        // Arrange
        await setup(false)
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.click(screen.getByTestId("metric-link-button"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(toggleIsColorMetricLinkedToHeightMetric())
    })

    it("should reflect the unlinked state via aria-pressed, aria-label and title", async () => {
        // Arrange & Act
        await setup(false)

        // Assert
        const button = screen.getByTestId("metric-link-button")
        expect(button.getAttribute("aria-pressed")).toBe("false")
        expect(button.getAttribute("aria-label")).toBe("Link Height and Color Metric")
        expect(button.getAttribute("title")).toBe("Link Height and Color Metric")
    })

    it("should reflect the linked state via aria-pressed, aria-label and title", async () => {
        // Arrange & Act
        await setup(true)

        // Assert
        const button = screen.getByTestId("metric-link-button")
        expect(button.getAttribute("aria-pressed")).toBe("true")
        expect(button.getAttribute("aria-label")).toBe("Unlink Height and Color Metric")
        expect(button.getAttribute("title")).toBe("Unlink Height and Color Metric")
    })

    it("should show the link icon when linked", async () => {
        // Arrange & Act
        const { container } = await setup(true)

        // Assert
        expect(container.querySelector("i.fa.fa-link")).not.toBeNull()
        expect(container.querySelector("i.fa.fa-unlink")).toBeNull()
    })

    it("should show the unlink icon when not linked", async () => {
        // Arrange & Act
        const { container } = await setup(false)

        // Assert
        expect(container.querySelector("i.fa.fa-unlink")).not.toBeNull()
        expect(container.querySelector("i.fa.fa-link")).toBeNull()
    })
})
