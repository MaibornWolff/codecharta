import { TestBed } from "@angular/core/testing"
import { NavigationEnd, NavigationStart, Router } from "@angular/router"
import { EffectsModule } from "@ngrx/effects"
import { StoreModule } from "@ngrx/store"
import { Subject } from "rxjs"
import { CloseDialogsOfLeftViewEffect } from "./closeDialogsOfLeftView.effect"

describe("CloseDialogsOfLeftViewEffect", () => {
    let routerEvents: Subject<unknown>
    let close: jest.Mock

    beforeEach(() => {
        routerEvents = new Subject()
        close = jest.fn()
        HTMLDialogElement.prototype.close = close
        document.body.innerHTML = `
            <cc-nav-bar><dialog id="nav-bar" open></dialog></cc-nav-bar>
            <router-outlet></router-outlet>
            <cc-view>
                <dialog id="open-in-view" open></dialog>
                <dialog id="closed-in-view"></dialog>
            </cc-view>
            <cc-changelog-dialog><dialog id="changelog" open></dialog></cc-changelog-dialog>
        `
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot({}), EffectsModule.forRoot([CloseDialogsOfLeftViewEffect])],
            providers: [{ provide: Router, useValue: { events: routerEvents } }]
        })
        TestBed.inject(CloseDialogsOfLeftViewEffect)
    })

    afterEach(() => {
        document.body.innerHTML = ""
    })

    const closedDialogIds = () => close.mock.contexts.map((dialog: HTMLDialogElement) => dialog.id)

    it("should close only the open dialogs of the view when a navigation starts", () => {
        // Act
        routerEvents.next(new NavigationStart(1, "/domain"))

        // Assert
        expect(closedDialogIds()).toEqual(["open-in-view"])
    })

    it("should leave the dialogs open on any other router event", () => {
        // Act
        routerEvents.next(new NavigationEnd(1, "/domain", "/domain"))

        // Assert
        expect(close).not.toHaveBeenCalled()
    })
})
