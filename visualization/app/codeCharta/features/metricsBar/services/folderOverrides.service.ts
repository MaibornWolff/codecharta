import { Injectable } from "@angular/core"
import { MarkedPackage } from "../../../codeCharta.model"
import { FolderOverridesStore } from "../stores/folderOverrides.store"

@Injectable({
    providedIn: "root"
})
export class FolderOverridesService {
    constructor(private readonly folderOverridesStore: FolderOverridesStore) {}

    markedPackagesWithCounts$() {
        return this.folderOverridesStore.markedPackagesWithCounts$
    }

    markableFolderPaths$() {
        return this.folderOverridesStore.markableFolderPaths$
    }

    markPackage(markedPackage: MarkedPackage) {
        this.folderOverridesStore.markPackage(markedPackage)
    }

    unmarkPackage(path: string) {
        this.folderOverridesStore.unmarkPackage(path)
    }
}
