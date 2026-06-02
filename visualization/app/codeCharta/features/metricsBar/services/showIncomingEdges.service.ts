import { Injectable } from "@angular/core"
import { ShowIncomingEdgesStore } from "../stores/showIncomingEdges.store"

@Injectable({
    providedIn: "root"
})
export class ShowIncomingEdgesService {
    constructor(private readonly showIncomingEdgesStore: ShowIncomingEdgesStore) {}

    showIncomingEdges$() {
        return this.showIncomingEdgesStore.showIncomingEdges$
    }

    setShowIncomingEdges(value: boolean) {
        this.showIncomingEdgesStore.setShowIncomingEdges(value)
    }
}
