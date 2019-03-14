import {CCFile, FileSelectionState, FileState} from "../codeCharta.model";
import {IAngularEvent, IRootScopeService} from "angular";

export interface FileStateServiceSubscriber {
    onFileSelectionStatesChanged(fileStates: FileState[], event: IAngularEvent)
    onImportedFilesChanged(fileStates: FileState[], event: IAngularEvent)
}

export class FileStateService {

    private static FILE_STATE_CHANGED_EVENT = "file-selection-states-changed";
    private static IMPORTED_FILES_CHANGED_EVENT = "imported-files-changed";

    private fileStates: Array<FileState> = []


    /* @ngInject */
    constructor(
        private $rootScope: IRootScopeService){
    }

    public addFile(file: CCFile) {
        this.fileStates.push({file: file, selectedAs: FileSelectionState.None})
        this.notifyFileImport()
    }

    public getCCFiles(): CCFile[] {
        return this.fileStates.map(x => x.file)
    }

    public getFileStates(): FileState[] {
        return this.fileStates
    }

    public setSingle(file: CCFile) {
        this.resetSelectionStates()
        const matchedFile = this.fileStates.find(x => x.file == file)
        if (matchedFile) {
            matchedFile.selectedAs = FileSelectionState.Single
        }
        this.notifySelectionChange()
    }

    public setDelta(reference: CCFile, comparison: CCFile) {
        this.resetSelectionStates()
        const matchedReferenceFile = this.fileStates.find(x => x.file == reference)
        const matchedComparisonFile = this.fileStates.find(x => x.file == comparison)

        if (matchedReferenceFile && matchedComparisonFile) {
            matchedReferenceFile.selectedAs = FileSelectionState.Reference
            matchedComparisonFile.selectedAs = FileSelectionState.Comparison
        }
        this.notifySelectionChange()
    }

    public setMultiple(multipleFiles: CCFile[]) {
        this.resetSelectionStates()
        this.fileStates.filter(x => multipleFiles.indexOf(x.file) !== -1)
            .forEach(x => x.selectedAs = FileSelectionState.Partial)
        this.notifySelectionChange()
    }

    private resetSelectionStates() {
        this.fileStates.forEach(file => file.selectedAs = FileSelectionState.None)
    }

    private notifySelectionChange() {
        this.$rootScope.$broadcast(FileStateService.FILE_STATE_CHANGED_EVENT, this.fileStates)
    }

    private notifyFileImport() {
        this.$rootScope.$broadcast(FileStateService.IMPORTED_FILES_CHANGED_EVENT, this.fileStates)
    }

    public static subscribe($rootScope: IRootScopeService, subscriber: FileStateServiceSubscriber) {
        $rootScope.$on(FileStateService.FILE_STATE_CHANGED_EVENT, (event, data) => {
            subscriber.onFileSelectionStatesChanged(data, event)
        })
        $rootScope.$on(FileStateService.IMPORTED_FILES_CHANGED_EVENT, (event, data) => {
            subscriber.onImportedFilesChanged(data, event)
        })
    }

}