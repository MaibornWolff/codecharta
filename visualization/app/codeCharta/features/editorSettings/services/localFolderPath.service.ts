import { Injectable } from "@angular/core"
import { LocalFolderPathStore } from "../stores/localFolderPath.store"

@Injectable({
    providedIn: "root"
})
export class LocalFolderPathService {
    constructor(private readonly localFolderPathStore: LocalFolderPathStore) {}

    localFolderPath$() {
        return this.localFolderPathStore.localFolderPath$
    }

    setLocalFolderPath(value: string) {
        this.localFolderPathStore.setLocalFolderPath(value)
    }
}
