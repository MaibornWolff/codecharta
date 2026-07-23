import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { routeLinks } from "../../../../routing/routePaths"
import { ViewSwitcherReadStore } from "../../stores/viewSwitcher.read.store"

@Component({
    selector: "cc-view-switcher",
    templateUrl: "./viewSwitcher.component.html",
    imports: [RouterLink, RouterLinkActive],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    host: { class: "contents" }
})
export class ViewSwitcherComponent {
    private readonly readStore = inject(ViewSwitcherReadStore)

    readonly hasDomainData = this.readStore.hasDomainData
    readonly routeLinks = routeLinks
}
