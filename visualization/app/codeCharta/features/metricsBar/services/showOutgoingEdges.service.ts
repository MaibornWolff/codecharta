import { Injectable } from "@angular/core"
import { ShowOutgoingEdgesStore } from "../stores/showOutgoingEdges.store"

@Injectable({
    providedIn: "root"
})
export class ShowOutgoingEdgesService {
    constructor(private readonly showOutgoingEdgesStore: ShowOutgoingEdgesStore) {}

    showOutgoingEdges$() {
        return this.showOutgoingEdgesStore.showOutgoingEdges$
    }

    setShowOutgoingEdges(value: boolean) {
        this.showOutgoingEdgesStore.setShowOutgoingEdges(value)
    }
}
