import { ComponentFixture, TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setState } from "../../../../../state/store/state.actions"
import { defaultState } from "../../../../../state/store/state.manager"
import { getLastAction } from "../../../../../util/testUtils/store.utils"
import { ResetSettingsButtonComponent } from "./resetSettingsButton.component"

describe("ResetSettingsButtonComponent", () => {
    let fixture: ComponentFixture<ResetSettingsButtonComponent>
    let store: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ResetSettingsButtonComponent],
            providers: [provideMockStore(), { provide: State, useValue: { getValue: () => defaultState } }]
        })
    })

    it("should render button with icon", () => {
        // Arrange
        fixture = TestBed.createComponent(ResetSettingsButtonComponent)
        fixture.componentRef.setInput("settingsKeys", ["appSettings.test"])

        // Act
        fixture.detectChanges()

        // Assert
        const button = screen.getByRole("button")
        expect(button).toBeTruthy()
        const icon = button.querySelector(".fa-undo")
        expect(icon).toBeTruthy()
    })

    it("should render button with label when provided", () => {
        // Arrange
        fixture = TestBed.createComponent(ResetSettingsButtonComponent)
        fixture.componentRef.setInput("settingsKeys", ["appSettings.test"])
        fixture.componentRef.setInput("label", "Reset Settings")

        // Act
        fixture.detectChanges()

        // Assert
        expect(screen.getByText("Reset Settings")).toBeTruthy()
    })

    it("should not render label when not provided", () => {
        // Arrange
        fixture = TestBed.createComponent(ResetSettingsButtonComponent)
        fixture.componentRef.setInput("settingsKeys", ["appSettings.test"])

        // Act
        fixture.detectChanges()

        // Assert
        const button = screen.getByRole("button")
        const labelSpan = button.querySelector("span")
        expect(labelSpan).toBeFalsy()
    })

    it("should apply tooltip as title attribute when provided", () => {
        // Arrange
        fixture = TestBed.createComponent(ResetSettingsButtonComponent)
        fixture.componentRef.setInput("settingsKeys", ["appSettings.test"])
        fixture.componentRef.setInput("tooltip", "Reset to defaults")

        // Act
        fixture.detectChanges()

        // Assert
        const button = screen.getByRole("button")
        expect(button.getAttribute("title")).toBe("Reset to defaults")
    })

    it("should dispatch setState action when clicked", async () => {
        // Arrange
        fixture = TestBed.createComponent(ResetSettingsButtonComponent)
        fixture.componentRef.setInput("settingsKeys", ["appSettings.layoutAlgorithm"])
        fixture.componentRef.setInput("label", "Reset")
        store = TestBed.inject(MockStore)
        fixture.detectChanges()

        // Act
        const button = screen.getByRole("button")
        await userEvent.click(button)

        // Assert
        const action = await getLastAction(store)
        expect(action.type).toBe(setState.type)
        expect((action as ReturnType<typeof setState>).value).toBeTruthy()
    })

    it("should emit callback when clicked", async () => {
        // Arrange
        fixture = TestBed.createComponent(ResetSettingsButtonComponent)
        fixture.componentRef.setInput("settingsKeys", ["appSettings.test"])
        store = TestBed.inject(MockStore)
        fixture.detectChanges()

        let callbackEmitted = false
        fixture.componentInstance.callback.subscribe(() => {
            callbackEmitted = true
        })

        // Act
        const button = screen.getByRole("button")
        await userEvent.click(button)

        // Assert
        expect(callbackEmitted).toBe(true)
    })
})
