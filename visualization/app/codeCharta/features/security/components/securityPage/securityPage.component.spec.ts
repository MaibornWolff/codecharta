import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject } from "rxjs"
import { packageRowsOf, securitySummaryOf } from "../../../../lenses/security/security.facade"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { ViewHandoffStore } from "../../../../routing/viewHandoff.store"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { shopSecurity } from "../../../../util/security/security.mocks"
import { SecurityReadStore } from "../../stores/security.read.store"
import { SecurityWriteStore } from "../../stores/security.write.store"
import { SecurityPageComponent } from "./securityPage.component"

describe("SecurityPageComponent", () => {
    const showFileInMap = jest.fn()
    const markReady = jest.fn()
    let activeView$: BehaviorSubject<ViewId>

    async function setup() {
        const security = shopSecurity()
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: SecurityReadStore,
                    useValue: { rows: signal(packageRowsOf(security)), summary: signal(securitySummaryOf(security)) }
                },
                { provide: SecurityWriteStore, useValue: { showFileInMap } },
                { provide: ViewReadinessStore, useValue: { markReady } },
                { provide: ActiveViewStore, useValue: { activeView$ } }
            ]
        })
        return render(SecurityPageComponent)
    }

    const shownPackages = () => screen.getAllByTestId("security-package-row").map(row => row.textContent)

    beforeEach(() => {
        showFileInMap.mockClear()
        markReady.mockClear()
        activeView$ = new BehaviorSubject<ViewId>("metrics")
    })

    it("should list every package, the vulnerable one first, under a summary of what was measured", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(shownPackages()).toHaveLength(4)
        expect(shownPackages()[0]).toContain("qs")
        expect(shownPackages()[0]).toContain("high")
        expect(screen.getByTestId("security-summary").textContent).toContain("versions looked up on 2026-11-09")
        expect(markReady).toHaveBeenCalledWith("security")
    })

    it("should list only vulnerable or outdated packages that match the filter", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getByTestId("security-only-problems"))
        await userEvent.type(screen.getByTestId("security-filter"), "ex")

        // Assert
        expect(shownPackages()).toHaveLength(1)
        expect(shownPackages()[0]).toContain("express")
    })

    it("should open a package's vulnerabilities and files and show a file on the map", async () => {
        // Arrange
        await setup()

        // Act
        await userEvent.click(screen.getAllByTestId("security-package-row")[0])
        await userEvent.click(screen.getByRole("button", { name: "src/server/routes.ts" }))

        // Assert
        expect(screen.getByTestId("security-package-details").textContent).toContain("fixed in 6.5.3")
        expect(showFileInMap).toHaveBeenCalledWith("/root/src/server/routes.ts")
    })

    it("should list the packages a file handed over from another view uses, until the reader clears it", async () => {
        // Arrange
        await setup()
        TestBed.inject(ViewHandoffStore).handOverNode("security", "/root/src/server")

        // Act
        activeView$.next("security")
        await screen.findByTestId("security-scope")
        const scoped = shownPackages()
        await userEvent.click(screen.getByRole("button", { name: "Show every package" }))

        // Assert
        expect(scoped).toEqual([expect.stringContaining("qs"), expect.stringContaining("express")])
        expect(shownPackages()).toHaveLength(4)
    })

    it("should list two hundred packages at a time and say when nothing was checked", async () => {
        // Arrange
        const security = shopSecurity({ vulnerabilitiesMeasured: false, vulnerabilitySources: [], versionsLookup: undefined })
        for (let index = 0; index < 250; index++) {
            security.packages[`pkg:npm/extra-${index}@1.0.0`] = { name: `extra-${index}`, version: "1.0.0", ecosystem: "npm" }
        }
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: SecurityReadStore,
                    useValue: { rows: signal(packageRowsOf(security)), summary: signal(securitySummaryOf(security)) }
                },
                { provide: SecurityWriteStore, useValue: { showFileInMap } },
                { provide: ViewReadinessStore, useValue: { markReady } },
                { provide: ActiveViewStore, useValue: { activeView$ } }
            ]
        })
        await render(SecurityPageComponent)

        // Act
        const shownBefore = shownPackages().length
        await userEvent.click(screen.getByTestId("security-show-more"))

        // Assert
        expect(shownBefore).toBe(200)
        expect(shownPackages()).toHaveLength(254)
        expect(screen.getByTestId("security-summary").textContent).toContain("not measured")
        expect(shownPackages()[0]).toContain("not checked")
        await userEvent.click(screen.getAllByTestId("security-package-row").find(row => row.textContent.includes("left-pad")))
        expect(screen.getByTestId("security-package-details").textContent).toContain("Not checked")
    })
})
