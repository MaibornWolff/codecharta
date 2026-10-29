import { Injectable, inject, signal } from "@angular/core"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { isPartialState } from "../../../model/files/files.helper"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { getTopLevelMapName } from "../../../util/nodePathHelper"
import { findFile, hasReadPermission, isFolderPickerSupported, LocalDirectoryHandle, pickFolder } from "./fileSystemAccess"
import { LocalSourceFolder, LocalSourceFoldersRepository } from "./localSourceFolders.repository"
import { relativePathOf, sampleFilePaths } from "./localSourcePaths"

const FIT_CHECK_SAMPLE_SIZE = 20

export type FolderChoice = { status: "chosen"; folder: LocalSourceFolder } | { status: "cancelled" } | { status: "doesNotFitMap" }

export type SourceLookup =
    | { status: "found"; file: File; folder: LocalSourceFolder; relativePath: string }
    | { status: "notFound"; relativePath: string }
    | { status: "cancelled" }
    | { status: "doesNotFitMap" }

interface MapLocation {
    mapFileName: string
    map: CodeMapNode
    relativePath: string
}

@Injectable({ providedIn: "root" })
export class LocalSourceService {
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly repository = inject(LocalSourceFoldersRepository)

    private readonly changeCount = signal(0)

    readonly isSupported = isFolderPickerSupported()
    readonly folderChanges = this.changeCount.asReadonly()

    isMapRoot(nodePath: string): boolean {
        return this.locate(nodePath)?.relativePath === ""
    }

    async findSource(nodePath: string): Promise<SourceLookup> {
        const location = this.locate(nodePath)
        if (!location) {
            return { status: "notFound", relativePath: nodePath }
        }
        const savedFolder = await this.readableSavedFolder(location.mapFileName)
        const file = savedFolder && (await findFile(savedFolder.directory, location.relativePath))
        if (file) {
            return { status: "found", file, folder: savedFolder, relativePath: location.relativePath }
        }
        return this.findSourceInChosenFolder(location)
    }

    async chooseFolder(nodePath: string): Promise<FolderChoice> {
        const location = this.locate(nodePath)
        return location ? this.chooseFolderFor(location) : { status: "cancelled" }
    }

    async chooseFolderForMap(mapFileName: string): Promise<FolderChoice> {
        const fileState = this.fileStoreReadWindow
            .getFiles()
            .find(loadedFileState => loadedFileState.file.fileMeta.fileName === mapFileName)
        return fileState ? this.chooseFolderFor({ mapFileName, map: fileState.file.map, relativePath: "" }) : { status: "cancelled" }
    }

    /** The full path once it was entered for the editor, as only that tells where the folder lies; else the folder's name. */
    async describeFolder(mapFileName: string): Promise<string | null> {
        const folder = await this.repository.find(mapFileName)
        return folder ? (folder.editorRootPath ?? folder.directory.name) : null
    }

    async forgetFolder(mapFileName: string): Promise<void> {
        await this.repository.delete(mapFileName)
        this.markFoldersChanged()
    }

    async saveEditorRootPath(folder: LocalSourceFolder, editorRootPath: string): Promise<LocalSourceFolder> {
        const updatedFolder = { ...folder, editorRootPath }
        await this.saveFolder(updatedFolder)
        return updatedFolder
    }

    private async findSourceInChosenFolder(location: MapLocation): Promise<SourceLookup> {
        const choice = await this.chooseFolderFor(location)
        if (choice.status !== "chosen") {
            return choice
        }
        const { relativePath } = location
        const file = await findFile(choice.folder.directory, relativePath)
        return file ? { status: "found", file, folder: choice.folder, relativePath } : { status: "notFound", relativePath }
    }

    private async chooseFolderFor({ mapFileName, map }: MapLocation): Promise<FolderChoice> {
        const directory = await pickFolder()
        if (!directory) {
            return { status: "cancelled" }
        }
        if (!(await fitsMap(directory, map))) {
            return { status: "doesNotFitMap" }
        }
        const folder = { mapKey: mapFileName, directory, editorRootPath: await this.editorRootPathOfSameFolder(mapFileName, directory) }
        await this.saveFolder(folder)
        return { status: "chosen", folder }
    }

    private async editorRootPathOfSameFolder(mapFileName: string, directory: LocalDirectoryHandle): Promise<string | null> {
        const savedFolder = await this.repository.find(mapFileName)
        return savedFolder && (await savedFolder.directory.isSameEntry(directory)) ? savedFolder.editorRootPath : null
    }

    private async saveFolder(folder: LocalSourceFolder): Promise<void> {
        await this.repository.save(folder)
        this.markFoldersChanged()
    }

    private markFoldersChanged() {
        this.changeCount.update(count => count + 1)
    }

    private async readableSavedFolder(mapFileName: string): Promise<LocalSourceFolder | null> {
        const folder = await this.repository.find(mapFileName)
        return folder && (await hasReadPermission(folder.directory)) ? folder : null
    }

    private locate(nodePath: string): MapLocation | null {
        const visibleFileStates = this.fileStoreReadWindow.getVisibleFileStates()
        const areMultipleMapsVisible = visibleFileStates.length > 1 && isPartialState(visibleFileStates)
        const mapFileName = areMultipleMapsVisible ? getTopLevelMapName(nodePath) : visibleFileStates[0]?.file.fileMeta.fileName
        const fileState = visibleFileStates.find(visibleFileState => visibleFileState.file.fileMeta.fileName === mapFileName)
        if (!fileState) {
            return null
        }
        return {
            mapFileName,
            map: fileState.file.map,
            relativePath: relativePathOf(nodePath, areMultipleMapsVisible ? mapFileName : null)
        }
    }
}

async function fitsMap(directory: LocalDirectoryHandle, map: CodeMapNode): Promise<boolean> {
    const samples = sampleFilePaths(map, FIT_CHECK_SAMPLE_SIZE)
    const foundFiles = await Promise.all(samples.map(samplePath => findFile(directory, samplePath)))
    return foundFiles.some(file => file !== null)
}
