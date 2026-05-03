import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { defaultState } from "../../../../state/store/state.manager"
import { BottomBarComponent } from "./bottomBar.component"

describe("BottomBarComponent", () => {
    it("should render one cc-hovered-path and one cc-attribution", async () => {
        // Arrange & Act
        const { container } = await render(BottomBarComponent, {
            providers: [provideMockStore({ initialState: defaultState })]
        })

        // Assert
        expect(container.querySelectorAll("cc-hovered-path").length).toBe(1)
        expect(container.querySelectorAll("cc-attribution").length).toBe(1)
    })
})
