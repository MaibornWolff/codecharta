import {CCFile, FileSelectionState, FileState, MetricData} from "../codeCharta.model";
import {IAngularEvent, IRootScopeService} from "angular";
import {MetricCalculator} from "../MetricCalculator";

export interface FileStateServiceSubscriber {
    onFileSelectionStatesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: IAngularEvent)
    onImportedFilesChanged(fileStates: FileState[], metricData: MetricData[], renderState: FileSelectionState, event: IAngularEvent)
}

export class FileStateService {

    private static FILE_STATE_CHANGED_EVENT = "file-selection-states-changed";
    private static IMPORTED_FILES_CHANGED_EVENT = "imported-files-changed";

    private fileStates: Array<FileState> = []
    private metricData: MetricData[] = []


    /* @ngInject */
    constructor(private $rootScope: IRootScopeService){

    }

    public getMetrics(): string[] {
        return this.metricData.map(x => x.name)
    }

    public getMetricData(): MetricData[] {
        return this.metricData
    }

    public addFile(file: CCFile) {
        this.fileStates.push({file: file, selectedAs: FileSelectionState.None})
        this.metricData = MetricCalculator.calculateMetrics(this.fileStates.map(x => x.file))
        this.notifyFileImport()
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
        this.$rootScope.$broadcast(FileStateService.FILE_STATE_CHANGED_EVENT, {fileStates: this.fileStates, metricData: this.metricData, renderState: this.getRenderState()})
    }

    private notifyFileImport() {
        console.log("notifyFileImport")
        this.$rootScope.$broadcast(FileStateService.IMPORTED_FILES_CHANGED_EVENT, {fileStates: this.fileStates, metricData: this.metricData, renderState: this.getRenderState()})
    }

    public getRenderState(): FileSelectionState {
        const firstFoundFileState: FileSelectionState = this.fileStates
            .map(x => x.selectedAs)
            .filter(state => state != FileSelectionState.None)[0]

        return (firstFoundFileState == FileSelectionState.Reference) ? FileSelectionState.Comparison : firstFoundFileState
    }

    public static subscribe($rootScope: IRootScopeService, subscriber: FileStateServiceSubscriber) {
        $rootScope.$on(FileStateService.FILE_STATE_CHANGED_EVENT, (event, data) => {
            subscriber.onFileSelectionStatesChanged(data.fileStates, data.metricData, data.renderState, event)
        })
        $rootScope.$on(FileStateService.IMPORTED_FILES_CHANGED_EVENT, (event, data) => {
            subscriber.onImportedFilesChanged(data.fileStates, data.metricData, data.renderState, event)
        })
    }

}