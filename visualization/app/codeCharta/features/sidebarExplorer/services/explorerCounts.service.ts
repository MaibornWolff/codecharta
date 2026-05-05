import { Injectable } from "@angular/core"
import { ExplorerCountsStore } from "../stores/explorerCounts.store"

@Injectable({
    providedIn: "root"
})
export class ExplorerCountsService {
    constructor(private readonly explorerCountsStore: ExplorerCountsStore) {}

    counts$ = this.explorerCountsStore.counts$
}
