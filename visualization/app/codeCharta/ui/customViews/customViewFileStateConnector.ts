"use strict"
import {FileSelectionState, FileState} from "../../model/files/files";
import {CustomViewMapSelectionMode} from "../../model/customView/customView.api.model";
import md5 from "md5";

export class CustomViewFileStateConnector {

    private files: FileState[] = []
    private fileNameParts: string[] = []
    private mapChecksums: string[] = []
    private mapSelectionMode: CustomViewMapSelectionMode = CustomViewMapSelectionMode.SINGLE

    constructor(files: FileState[]) {
        this.files = files

        this.processFiles()
    }

    private processFiles() {
        this.files.forEach(file => {
            if (file.selectedAs !== FileSelectionState.None) {
                this.setMapSelectionMode(file.selectedAs)
                this.mapChecksums.push(md5(JSON.stringify(file.file.map)))

                let fileNamePart = file.file.fileMeta.fileName

                const ccJsonExtensionIndex = fileNamePart.indexOf(".cc.json")
                if (ccJsonExtensionIndex >= 0) {
                    fileNamePart = fileNamePart.slice(0, ccJsonExtensionIndex)
                }

                this.fileNameParts.push(fileNamePart)
            }
        })
    }

    getJointMapName(): string {
        return this.fileNameParts.join(" ")
    }

    private setMapSelectionMode(fileSelectionState: string) {
        if (fileSelectionState === FileSelectionState.Partial) {
            this.mapSelectionMode = CustomViewMapSelectionMode.MULTIPLE
        } else if (
            fileSelectionState === FileSelectionState.Comparison ||
            fileSelectionState === FileSelectionState.Reference
        ) {
            this.mapSelectionMode = CustomViewMapSelectionMode.DELTA
        }
    }

    isMapSelectionModeSingle(): boolean {
        return this.mapSelectionMode === CustomViewMapSelectionMode.SINGLE
    }

    isMapSelectionModeDelta(): boolean {
        return this.mapSelectionMode === CustomViewMapSelectionMode.DELTA
    }

    getMapSelectionMode(): CustomViewMapSelectionMode {
        return this.mapSelectionMode
    }

    getChecksumOfAssignedMaps(): string {
        return this.mapChecksums.join(";")
    }
}
