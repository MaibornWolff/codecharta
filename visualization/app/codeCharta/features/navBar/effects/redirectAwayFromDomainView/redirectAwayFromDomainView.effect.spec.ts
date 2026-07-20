import { TestBed } from "@angular/core/testing"
import { NavigationEnd, Router } from "@angular/router"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Subject } from "rxjs"
import { DomainLensData, FileSelectionState, FileState } from "../../../../model/codeCharta.model"
import { routeLinks } from "../../../../routing/routePaths"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { RedirectAwayFromDomainViewEffect } from "./redirectAwayFromDomainView.effect"

describe("RedirectAwayFromDomainViewEffect", () => {
    let store: MockStore
    let router: { url: string; events: Subject<unknown>; navigateByUrl: jest.Mock }

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

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([RedirectAwayFromDomainViewEffect])],
            providers: [{ provide: Router, useValue: router }, provideMockStore({ initialState: defaultState })]
        })

        store = TestBed.inject(MockStore)
    }

    /**
     * Only the file states change — production writes the MERGED domain word bank a macrotask later,
     * so a redirect that waited for it would fire in between and bounce cc.json 2.0 files as well.
     */
    function loadFile(domainWords: DomainLensData) {
        store.setState({ ...defaultState, files: aLoadedFile(domainWords) })
    }

    // Selector overrides are held statically by MockStore, so they outlive the TestBed unless reset.
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

    it("should redirect to the metrics view when a file without a domain lens is loaded on the domain view", () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile({})

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should redirect to the metrics view when the domain view is deep linked with a query string", () => {
        // Arrange
        setup(`${routeLinks.domain}?file=some.cc.json`)

        // Act
        loadFile({})

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should replace the history entry, so the back button cannot return to the empty domain view", () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile({})

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, expect.objectContaining({ replaceUrl: true }))
    })

    it("should stay on the domain view when the loaded file has a domain lens", () => {
        // Arrange
        setup(routeLinks.domain)

        // Act
        loadFile(aDomainLens)

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should not redirect before a file is loaded, so a domain deep link survives its own boot", () => {
        // Arrange
        setup(routeLinks.domain)

        // Act — the router settles on the deep link while the file is still being read
        navigateTo(routeLinks.domain)

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should not redirect when the user is already on the metrics view", () => {
        // Arrange
        setup(routeLinks.metrics)

        // Act
        loadFile({})

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it("should redirect when the domain view is opened after a file without a domain lens has settled", () => {
        // Arrange — the file arrives while the metrics view is open, so no redirect is due yet
        setup(routeLinks.metrics)
        loadFile({})

        // Act — the user reaches the domain view by hash edit or shared link, without any store change
        navigateTo(routeLinks.domain)

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should not redirect when the domain view is opened after a file with a domain lens has settled", () => {
        // Arrange
        setup(routeLinks.metrics)
        loadFile(aDomainLens)

        // Act
        navigateTo(routeLinks.domain)

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    /**
     * The nav bar swaps the view switcher for the delta chrome in delta mode, so a user left on the domain
     * view there has no Map control anywhere — the domain cloud merges both compared word banks and carries
     * no delta semantics anyway.
     */
    it("should redirect to the metrics view when delta mode is entered on the domain view", () => {
        // Arrange
        setup(routeLinks.domain)
        loadFile(aDomainLens)

        // Act
        enterDeltaMode()

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    it("should redirect to the metrics view when the domain view is opened while delta mode is active", () => {
        // Arrange
        setup(routeLinks.metrics)
        loadFile(aDomainLens)
        enterDeltaMode()

        // Act
        navigateTo(routeLinks.domain)

        // Assert
        expect(router.navigateByUrl).toHaveBeenCalledWith(routeLinks.metrics, { replaceUrl: true })
    })

    /**
     * The IndexedDB restore commits the same file TWICE under one checksum: first re-parsed from the
     * persisted state, which loses the domain lens on the way through the flat 1.x export shape, and only
     * then the persisted file state that still carries it. Reading the second write is the whole point —
     * a projection memoized on visible-file checksums cannot tell the two apart and would keep answering
     * from the domain-less parse, bouncing the user out of the domain view on every restarted session.
     */
    it("should stay on the domain view when a restore replaced the parsed file with the persisted one", () => {
        // Arrange — boot lands on the metrics view and commits the lossy re-parse, then the persisted file
        setup(routeLinks.metrics)
        loadFile({})
        loadFile(aDomainLens)

        // Act — the user clicks Domain once the restored session has settled
        navigateTo(routeLinks.domain)

        // Assert
        expect(router.navigateByUrl).not.toHaveBeenCalled()
    })
})
