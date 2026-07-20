import { Injectable, signal } from "@angular/core"

const LOCAL_STORAGE_KEY = "codeChartaExplorerCollapsed"

@Injectable({ providedIn: "root" })
export class ExplorerCollapseService {
    readonly isCollapsed = signal(localStorage.getItem(LOCAL_STORAGE_KEY) === "true")

    toggle() {
        this.isCollapsed.update(value => !value)
        this.persist()
    }

    expand() {
        this.isCollapsed.set(false)
        this.persist()
    }

    private persist() {
        localStorage.setItem(LOCAL_STORAGE_KEY, String(this.isCollapsed()))
    }
}
