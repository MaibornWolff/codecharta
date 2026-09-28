import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DependencyMapComponent, provideDependencyMapContextMenuActions } from "../../features/dependencyMap/facade"
import {
    NODE_CONTEXT_MENU_CAPABILITIES,
    NodeContextMenuCapabilities,
    NodeContextMenuComponent
} from "../../features/nodeContextMenu/facade"
import { LoadingFileProgressSpinnerComponent, provideViewScopedCssVariables } from "../../features/shared/facade"

@Component({
    selector: "cc-dependency-view",
    templateUrl: "./dependencyView.component.html",
    imports: [DependencyMapComponent, NodeContextMenuComponent, BottomBarComponent, LoadingFileProgressSpinnerComponent],
    providers: [
        {
            provide: NODE_CONTEXT_MENU_CAPABILITIES,
            useValue: { showMapActions: false, jumpTargetView: "metrics" } satisfies NodeContextMenuCapabilities
        },
        provideDependencyMapContextMenuActions(),
        provideViewScopedCssVariables()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyViewComponent {}
