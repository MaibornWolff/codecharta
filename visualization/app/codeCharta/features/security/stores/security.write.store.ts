import { Injectable, inject } from "@angular/core"
import { Router } from "@angular/router"
import { routeLinks } from "../../../routing/routePaths"
import { ViewHandoffStore } from "../../../routing/viewHandoff.store"

@Injectable({ providedIn: "root" })
export class SecurityWriteStore {
    private readonly viewHandoffStore = inject(ViewHandoffStore)
    private readonly router = inject(Router)

    showFileInMap(filePath: string) {
        this.viewHandoffStore.handOverNode("metrics", filePath)
        void this.router.navigateByUrl(routeLinks.metrics)
    }
}
