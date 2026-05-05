import { Injectable, signal } from "@angular/core"

@Injectable({ providedIn: "root" })
export class ExplorerCollapseService {
    readonly isCollapsed = signal(false)

    toggle() {
        this.isCollapsed.update(value => !value)
    }
}
