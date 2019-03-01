import {CCFile, FileSelectionState, FileState} from "../codeCharta.model";
import {IAngularEvent, IRootScopeService} from "angular";

export interface FileStateServiceSubscriber {
    onFileSelectionStatesChanged(fileStates: FileState[], event: IAngularEvent)
}

export class FileStateService {

    private fileStates: Array<FileState> = []
    private static FILESTATE_CHANGED_EVENT = "file-selection-states-changed";


    /* @ngInject */
    constructor(private $rootScope: IRootScopeService){

    }

    public addFile(file: CCFile) {
        this.fileStates.push({file: file, selectedAs: FileSelectionState.None})
    }

    public getFileStates(): FileState[] {
        return this.fileStates
    }

    public getCCFiles(): CCFile[] {
        return this.fileStates.map(x => x.file)
    }

    public setSingle(file: CCFile) {
        this.resetSelectionStates()
        const matchedFile = this.fileStates.find(x => x.file == file)
        if (matchedFile) {
            matchedFile.selectedAs = FileSelectionState.Single
        }
        this.notify()
    }

    public setDelta(reference: CCFile, comparison: CCFile) {
        this.resetSelectionStates()
        const matchedReferenceFile = this.fileStates.find(x => x.file == reference)
        const matchedComparisonFile = this.fileStates.find(x => x.file == comparison)

        if (matchedReferenceFile && matchedComparisonFile) {
            matchedReferenceFile.selectedAs = FileSelectionState.Reference
            matchedComparisonFile.selectedAs = FileSelectionState.Comparison
        }
        this.notify()
    }

    public setMultiple(multipleFiles: CCFile[]) {
        this.resetSelectionStates()
        this.fileStates.filter(x => multipleFiles.indexOf(x.file) !== -1)
            .forEach(x => x.selectedAs = FileSelectionState.Partial)
        this.notify()
    }

    private resetSelectionStates() {
        this.fileStates.forEach(file => file.selectedAs = FileSelectionState.None)
    }

    private notify() {
        console.log(this.fileStates)
        this.$rootScope.$broadcast(FileStateService.FILESTATE_CHANGED_EVENT, this.fileStates)
    }

    public static subscribe($rootScope: IRootScopeService, subscriber: FileStateServiceSubscriber) {
        $rootScope.$on(FileStateService.FILESTATE_CHANGED_EVENT, (event, data) => {
            subscriber.onFileSelectionStatesChanged(data, event)
        })
    }

}