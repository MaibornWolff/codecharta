import { Injectable } from "@angular/core"
import { openDB } from "idb"
import { LocalDirectoryHandle } from "./fileSystemAccess"

export interface LocalSourceFolder {
    mapKey: string
    directory: LocalDirectoryHandle
    editorRootPath: string | null
}

// A database of its own: folder handles only exist in Chromium and never travel with the map, so they stay out
// of the persisted session and its migrations.
const DB_NAME = "CodeChartaLocalSource"
const DB_VERSION = 1
const FOLDERS_STORE_NAME = "folders"

@Injectable({ providedIn: "root" })
export class LocalSourceFoldersRepository {
    async find(mapKey: string): Promise<LocalSourceFolder | null> {
        const database = await openLocalSourceDB()
        return (await database.get(FOLDERS_STORE_NAME, mapKey)) ?? null
    }

    async save(folder: LocalSourceFolder): Promise<void> {
        const database = await openLocalSourceDB()
        await database.put(FOLDERS_STORE_NAME, folder)
    }

    async delete(mapKey: string): Promise<void> {
        const database = await openLocalSourceDB()
        await database.delete(FOLDERS_STORE_NAME, mapKey)
    }
}

function openLocalSourceDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(database) {
            database.createObjectStore(FOLDERS_STORE_NAME, { keyPath: "mapKey" })
        }
    })
}
