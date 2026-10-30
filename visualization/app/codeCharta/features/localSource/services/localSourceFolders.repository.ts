import { Injectable } from "@angular/core"
import { openDB } from "idb"
import { LocalDirectoryHandle } from "./fileSystemAccess"

export interface LocalSourceFolder {
    mapKey: string
    /** The folder chosen with the picker and the path for VS Code are set independently of each other. */
    directory: LocalDirectoryHandle | null
    editorRootPath: string | null
}

// A database of its own: folder handles only exist in Chromium and never travel with the map, so they stay out
// of the persisted session and its migrations.
const DB_NAME = "CodeChartaLocalSource"
const DB_VERSION = 1
const FOLDERS_STORE_NAME = "folders"

@Injectable({ providedIn: "root" })
export class LocalSourceFoldersRepository {
    /** A saved handle is read back once per session: every menu and map row asks for it again. */
    private readonly knownFolders = new Map<string, LocalSourceFolder | null>()

    async find(mapKey: string): Promise<LocalSourceFolder | null> {
        if (!this.knownFolders.has(mapKey)) {
            const database = await openLocalSourceDB()
            this.knownFolders.set(mapKey, (await database.get(FOLDERS_STORE_NAME, mapKey)) ?? null)
        }
        return this.knownFolders.get(mapKey)
    }

    /** Merges into what is saved now rather than what this tab knows, as another tab may have changed it since. */
    async update(mapKey: string, change: Partial<Omit<LocalSourceFolder, "mapKey">>): Promise<LocalSourceFolder> {
        const database = await openLocalSourceDB()
        const transaction = database.transaction(FOLDERS_STORE_NAME, "readwrite")
        const saved = await transaction.store.get(mapKey)
        const folder: LocalSourceFolder = { mapKey, directory: null, editorRootPath: null, ...saved, ...change }
        await transaction.store.put(folder)
        await transaction.done
        this.knownFolders.set(mapKey, folder)
        return folder
    }

    async delete(mapKey: string): Promise<void> {
        const database = await openLocalSourceDB()
        await database.delete(FOLDERS_STORE_NAME, mapKey)
        this.knownFolders.set(mapKey, null)
    }

    async deleteAll(): Promise<void> {
        const database = await openLocalSourceDB()
        await database.clear(FOLDERS_STORE_NAME)
        this.knownFolders.clear()
    }
}

function openLocalSourceDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(database) {
            database.createObjectStore(FOLDERS_STORE_NAME, { keyPath: "mapKey" })
        }
    })
}
