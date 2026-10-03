import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { STATE } from "../../../../mocks/dataMocks"
import { CcState } from "../../../../model/codeCharta.model"
import { currentFocusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { DomainSelectionStore } from "../../stores/domainSelection.store"
import { LetGoOfSelectionOutsideFocusEffect } from "./letGoOfSelectionOutsideFocus.effect"

describe("LetGoOfSelectionOutsideFocusEffect", () => {
    let store: MockStore
    let domainSelectionStore: DomainSelectionStore

    function focusOn(path: string | undefined) {
        store.overrideSelector(currentFocusedNodePathSelector, path)
        store.refreshState()
    }

    beforeEach(() => {
        const state: CcState = { ...STATE, sharedView: { ...STATE.sharedView, focusedNodePath: [] } }
        TestBed.configureTestingModule({ providers: [LetGoOfSelectionOutsideFocusEffect, provideMockStore({ initialState: state })] })
        store = TestBed.inject(MockStore)
        domainSelectionStore = TestBed.inject(DomainSelectionStore)
        domainSelectionStore.clear()
        TestBed.inject(LetGoOfSelectionOutsideFocusEffect).letGoOfSelectionOutsideFocus$.subscribe()
    })

    afterEach(() => {
        store.resetSelectors()
    })

    it("should let go of a selection outside the folder that gets focused, so the cloud shows the focus", () => {
        // Arrange
        domainSelectionStore.select("/root/api/client.ts")

        // Act
        focusOn("/root/billing")

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBeNull()
    })

    it("should keep a selection inside the folder that gets focused", () => {
        // Arrange
        domainSelectionStore.select("/root/billing/invoice.ts")

        // Act
        focusOn("/root/billing")

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBe("/root/billing/invoice.ts")
    })

    it("should keep the focused folder itself selected", () => {
        // Arrange
        domainSelectionStore.select("/root/billing")

        // Act
        focusOn("/root/billing")

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBe("/root/billing")
    })

    it("should let go of a selection in a folder whose name merely starts like the focused one", () => {
        // Arrange
        domainSelectionStore.select("/root/billing-legacy/invoice.ts")

        // Act
        focusOn("/root/billing")

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBeNull()
    })

    it("should keep the selection when the focus is let go", () => {
        // Arrange
        focusOn("/root/billing")
        domainSelectionStore.select("/root/api/client.ts")

        // Act
        focusOn(undefined)

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBe("/root/api/client.ts")
    })
})
