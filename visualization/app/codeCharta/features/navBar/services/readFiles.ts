import { ungzip } from "pako"
import { parseGameObjectsFile } from "../util/gameObjectsParser/gameObjectsImporter"
import { validateGameObjects } from "../util/gameObjectsParser/gameObjectsValidator"

export const readFiles = (files: FileList): Promise<string>[] => {
    const readFilesPromises: Promise<string>[] = []
    for (const file of files) {
        readFilesPromises.push(readFile(file))
    }
    return readFilesPromises
}

const readFile = async (file: File): Promise<string> => {
    if (file.name.endsWith(".gz")) {
        return ungzip(new Uint8Array(await file.arrayBuffer()), { to: "string" })
    }
    const content = await file.text()
    if (content.includes("gameObjectPositions") && validateGameObjects(content)) {
        return JSON.stringify(parseGameObjectsFile(content))
    }
    return content
}
