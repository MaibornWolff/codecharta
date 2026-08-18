import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Store, StoreModule } from "@ngrx/store"
import { render, screen, waitFor } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../../features/shared/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { CcState } from "../../../../model/codeCharta.model"
import { appReducers, setStateMiddleware } from "../../../../stores/rootStore/store"
import { blacklistSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { setSearchPattern } from "../../../../stores/sharedView/sharedView.write.facade"
import { resultsInEmptyMap } from "../../../../util/blacklist/resultsInEmptyMap"
import { BlacklistSearchPatternEffect } from "../../effects/blacklistSearchPattern/blacklistSearchPattern.effect"
import { createExplorerSearchMock } from "../../explorerPorts.mocks"
import { EXPLORER_SEARCH } from "../../explorerSearch.port"
import { ExplorerSearchActionsComponent } from "./explorerSearchActions.component"

jest.mock("../../../../util/blacklist/resultsInEmptyMap", () => ({
    resultsInEmptyMap: jest.fn()
}))
const mockedResultsInEmptyMap = jest.mocked(resultsInEmptyMap)

describe("ExplorerSearchActionsComponent", () => {
    const blacklistOf = (type: "flatten" | "exclude") => {
        let blacklist: { path: string; type: string }[] = []
        TestBed.inject<Store<CcState>>(Store)
            .select(blacklistSelector)
            .subscribe(items => (blacklist = items))
        return blacklist.filter(item => item.type === type)
    }

    const renderWithSearchPattern = async () => {
        const rendered = await render(ExplorerSearchActionsComponent)
        TestBed.inject(Store).dispatch(setSearchPattern({ value: "needle" }))
        return rendered
    }

    beforeEach(() => {
        mockedResultsInEmptyMap.mockImplementation(() => false)
        TestBed.configureTestingModule({
            imports: [
                ExplorerSearchActionsComponent,
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([BlacklistSearchPatternEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect])
            ],
            providers: [{ provide: EXPLORER_SEARCH, useValue: createExplorerSearchMock({ isPatternEmpty$: of(false) }) }]
        })
    })

    it("should flatten the current search pattern", async () => {
        // Arrange
        await renderWithSearchPattern()

        // Act
        await userEvent.click(await screen.findByTestId("search-bar-flatten-button"))

        // Assert
        await waitFor(() => expect(blacklistOf("flatten")).toEqual([{ path: "*needle*", type: "flatten" }]))
    })

    it("should exclude the current search pattern", async () => {
        // Arrange
        await renderWithSearchPattern()

        // Act
        await userEvent.click(await screen.findByTestId("search-bar-exclude-button"))

        // Assert
        await waitFor(() => expect(blacklistOf("exclude")).toEqual([{ path: "*needle*", type: "exclude" }]))
    })

    it("should hint at entering a pattern while the search is empty", async () => {
        // Arrange
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [ExplorerSearchActionsComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [{ provide: EXPLORER_SEARCH, useValue: createExplorerSearchMock() }]
        })

        // Act
        await render(ExplorerSearchActionsComponent)

        // Assert
        expect(screen.getByText("Enter a pattern to enable Flatten/Exclude")).not.toBe(null)
    })
})
