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
        this.notifyFileImport()
    }

    public getCCFiles(): CCFile[] {
        return this.fileStates.map(x => x.file)
    }

    public getFileStates(): FileState[] {
        return this.fileStates
    }

    public getVisibleFiles(): CCFile[] {
        return this.fileStates.filter(x => x.selectedAs != FileSelectionState.None).map(x => x.file)
    }

    public getVisibleFileStates(): FileState[] {
        return this.fileStates.filter(x => x.selectedAs != FileSelectionState.None)
    }

    public getFileStateByFileName(fileName: string): FileState {
        return this.fileStates.find(x => x.file.fileMeta.fileName == fileName)
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
        this.metricData = MetricCalculator.calculateMetrics(this.fileStates, this.getVisibleFileStates())

        this.$rootScope.$broadcast(FileStateService.FILE_STATE_CHANGED_EVENT,
            {fileStates: this.fileStates, metricData: this.metricData, renderState: FileStateService.getRenderState(this.fileStates)})
    }

    private notifyFileImport() {
        this.$rootScope.$broadcast(FileStateService.IMPORTED_FILES_CHANGED_EVENT,
            {fileStates: this.fileStates, metricData: this.metricData, renderState: FileStateService.getRenderState(this.fileStates)})
    }

    public static getRenderState(fileStates: FileState[]): FileSelectionState {
        const firstFoundFileState: FileSelectionState = fileStates
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