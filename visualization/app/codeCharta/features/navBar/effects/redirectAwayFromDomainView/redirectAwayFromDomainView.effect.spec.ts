import { TestBed } from "@angular/core/testing"
import { NavigationEnd, Router } from "@angular/router"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Subject } from "rxjs"
import { DomainLensData, FileSelectionState, FileState } from "../../../../model/codeCharta.model"
import { routeLinks } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { ToastService } from "../../../shared/facade"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"
import { RedirectAwayFromDomainViewEffect } from "./redirectAwayFromDomainView.effect"

describe("RedirectAwayFromDomainViewEffect", () => {
    let store: MockStore
    let router: { url: string; events: Subject<unknown>; navigateByUrl: jest.Mock }
    let toastService: { show: jest.Mock }
    let fileSelectionModeService: { toggle: jest.Mock }

    const aDomainLens: DomainLensData = { "/root": [{ text: "invoice", frequency: 3 }] }
    const persistedFileChecksum = "checksum-of-the-one-loaded-file"

    function aLoadedFile(domainWords: DomainLensData): FileState[] {
        return [
            {
                file: { fileMeta: { fileChecksum: persistedFileChecksum }, settings: { fileSettings: { domainWords } } },
                selectedAs: FileSelectionState.Partial
            }
        ] as FileState[]
    }

    function setup(currentUrl: string) {
        router = { url: currentUrl, events: new Subject(), navigateByUrl: jest.fn() }
        toastService = { show: jest.fn() }
        fileSelectionModeService = { toggle: jest.fn() }

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([RedirectAwayFromDomainViewEffect])],
            providers: [
                { provide: Router, useValue: router },
                { provide: ToastService, useValue: toastService },
                { provide: FileSelectionModeService, useValue: fileSelectionModeService },
                provideMockStore({ initialState: defaultState })
            ]
        })

        store = TestBed.inject(MockStore)
    }

    function settle(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 0))
    }

    function loadFile(domainWords: DomainLensData) {
        store.setState({ ...defaultState, files: aLoadedFile(domainWords) })
    }

    afterEach(() => {
        store.resetSelectors()
    })

    function enterDeltaMode() {
        store.overrideSelector(isDeltaStateSelector, true)
        store.refreshState()
    }

    function navigateTo(url: string) {
        router.url = url
        router.events.next(new NavigationEnd(1, url, url))
    }

    it("should redirect to the metrics view when a file without a domain lens is loaded on the domain view", async () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile({})
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should show a toast explaining the switch when a file without domain data is loaded on the domain view", async () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile({})
        await settle()

        // Assert
        expect(toastService.show).toHaveBeenCalledWith("This file has no domain-language data — switched to the map view.")
    })

    it("should not show a toast when the loaded file keeps the domain view reachable", async () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile(aDomainLens)
        await settle()

        // Assert
        expect(toastService.show).not.toHaveBeenCalled()
    })

    it("should redirect to the metrics view when the domain view is deep linked with a query string", async () => {
        // Arrange
        setup(`${routeLinks.domain}?file=some.cc.json`)

        // Act
        loadFile({})
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should replace the history entry, so the back button cannot return to the empty domain view", async () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile({})
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, expect.objectContaining({ replaceUrl: true }))
    })

    it("should stay on the domain view when the loaded file has a domain lens", async () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile(aDomainLens)
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should not redirect before a file is loaded, so a domain deep link survives its own boot", async () => {
        // Arrange
        setup(routeLinks.domain)

        // Act — the router settles on the deep link while the file is still being read
        navigateTo(routeLinks.domain)
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should not redirect when the user is already on the metrics view", async () => {
        // Arrange
        setup(routeLinks.metrics)

        // Act
        loadFile({})
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should redirect when the domain view is opened after a file without a domain lens has settled", async () => {
        // Arrange — the file arrives while the metrics view is open, so no redirect is due yet
        setup(routeLinks.metrics)
        loadFile({})
        await settle()

        // Act — the user reaches the domain view by hash edit or shared link, without any store change
        navigateTo(routeLinks.domain)
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should not redirect when the domain view is opened after a file with a domain lens has settled", async () => {
        // Arrange
        setup(routeLinks.metrics)
        loadFile(aDomainLens)
        await settle()

        // Act
        navigateTo(routeLinks.domain)
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should redirect to the metrics view when delta mode is entered on the domain view", async () => {
        // Arrange
        setup(routeLinks.domain)
        loadFile(aDomainLens)
        await settle()

        // Act
        enterDeltaMode()
        await settle()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should not show the missing-domain-data toast when the redirect is caused by delta mode", async () => {
        // Arrange
        setup(routeLinks.domain)
        loadFile(aDomainLens)
        await settle()

        // Act
        enterDeltaMode()
        await settle()

        // Assert
        expect(toastService.show).not.toHaveBeenCalled()
    })

    it("should leave compare mode instead of redirecting when the domain view is opened while it is active", async () => {
        // Arrange
        setup(routeLinks.metrics)
        loadFile(aDomainLens)
        enterDeltaMode()
        await settle()

        // Act
        navigateTo(routeLinks.domain)
        await settle()

        // Assert — compare is a mode of the metric view, so asking for the domain view ends it
        expect(fileSelectionModeService.toggle).toHaveBeenCalledTimes(1)
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should still leave compare mode when the domain view is opened before the first reason has settled", async () => {
        // Arrange — no settling, so the navigation beats the debounced reason it has to be judged against
        setup(routeLinks.metrics)
        loadFile(aDomainLens)
        enterDeltaMode()

        // Act
        navigateTo(routeLinks.domain)
        await settle()

        // Assert
        expect(fileSelectionModeService.toggle).toHaveBeenCalledTimes(1)
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should explain the dropped compare mode with a toast", async () => {
        // Arrange
        setup(routeLinks.metrics)
        loadFile(aDomainLens)
        enterDeltaMode()
        await settle()

        // Act
        navigateTo(routeLinks.domain)
        await settle()

        // Assert
        expect(toastService.show).toHaveBeenCalledWith("Left compare mode — the domain view shows a single word cloud.")
    })

    it("should redirect rather than leave compare mode when the opened domain view has no data to show", async () => {
        // Arrange
        setup(routeLinks.metrics)
        loadFile({})
        enterDeltaMode()
        await settle()

        // Act
        navigateTo(routeLinks.domain)
        await settle()

        // Assert
        expect(fileSelectionModeService.toggle).not.toHaveBeenCalled()
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should stay on the domain view when a restore replaced the parsed file with the persisted one", async () => {
        // Arrange — boot lands on the metrics view and commits the lossy re-parse, then the persisted file
        setup(routeLinks.metrics)
        loadFile({})
        loadFile(aDomainLens)
        await settle()

        // Act — the user clicks Domain once the restored session has settled
        navigateTo(routeLinks.domain)
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should stay on the domain view when a restore's lossy re-parse lands while it is on screen", async () => {
        // Arrange — the reload restores the deep link before the files arrive
        setup(routeLinks.domain)
        navigateTo(routeLinks.domain)

        // Act — the restore commits the re-parse and the persisted file state in the same task
        loadFile({})
        loadFile(aDomainLens)
        await settle()

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
        expect(toastService.show).not.toHaveBeenCalled()
    })
})
