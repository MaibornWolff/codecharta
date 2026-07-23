import { Injectable, inject, signal } from "@angular/core"
import { ExplorerCollapseRepo } from "../repos/explorerCollapse.repo"

@Injectable({ providedIn: "root" })
export class ExplorerCollapseService {
    private readonly explorerCollapseRepo = inject(ExplorerCollapseRepo)

    readonly isCollapsed = signal(this.explorerCollapseRepo.readIsCollapsed())

    toggle() {
        this.isCollapsed.update(value => !value)
        this.persist()
    }

    expand() {
        this.isCollapsed.set(false)
        this.persist()
    }

    private persist() {
        this.explorerCollapseRepo.writeIsCollapsed(this.isCollapsed())
    }
}
