import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { routeLinks } from "../../../../routing/routePaths"
import { ViewSwitcherReadStore } from "../../stores/viewSwitcher.read.store"

/**
 * Switches between the metrics (map) and domain (word-cloud) views via router navigation. Without a domain
 * lens the "Domain" option stays rendered but disabled, so users of cc.json 1.x files still learn the view
 * exists instead of it being invisible — a disabled button cannot navigate, so it can never strand anyone
 * on the domain view (RedirectAwayFromDomainViewEffect covers the enabled case).
 * The `?file=…` query survives the switch because the router only ever rewrites the URL fragment
 * (see app.config).
 * The host renders as `display: contents` so the empty-looking switcher never occupies a slot in the
 * nav bar's gap-1 flex run.
 */
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
