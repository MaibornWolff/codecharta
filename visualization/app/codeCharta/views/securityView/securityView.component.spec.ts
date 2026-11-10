import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { BehaviorSubject, of } from "rxjs"
import { SecurityReadStore } from "../../features/security/stores/security.read.store"
import { SecurityWriteStore } from "../../features/security/stores/security.write.store"
import { LoadingFileProgressSpinnerService } from "../../features/shared/services/loadingFileProgressSpinner.service"
import { ActiveViewStore } from "../../routing/activeView.store"
import { ViewReadinessStore } from "../../routing/viewReadiness.store"
import { SecurityViewComponent } from "./securityView.component"

describe("SecurityViewComponent", () => {
    it("should host the security page under the view's loading spinner", async () => {
        // Arrange
        TestBed.configureTestingModule({
            providers: [
                { provide: SecurityReadStore, useValue: { rows: signal([]), summary: signal(null) } },
                { provide: SecurityWriteStore, useValue: { showFileInMap: jest.fn() } },
                { provide: ViewReadinessStore, useValue: { markReady: jest.fn() } },
                { provide: ActiveViewStore, useValue: { activeView$: new BehaviorSubject("security") } },
                { provide: LoadingFileProgressSpinnerService, useValue: { isLoading$: () => of(false), phase$: () => of(null) } }
            ]
        })

        // Act
        await render(SecurityViewComponent)

        // Assert
        expect(screen.getByTestId("security-packages").textContent).toContain("No package matches.")
    })
})
