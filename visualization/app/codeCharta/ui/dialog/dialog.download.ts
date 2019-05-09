import "./dialog.scss"
import { FileDownloader } from "../../util/fileDownloader";
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { CCFile } from "../../codeCharta.model";
import {hierarchy} from "d3-hierarchy";
import _ from "lodash"
import { FileNameHelper } from "../../util/fileNameHelper";

interface FileDownloadContent {
    name: string,
    numberOfListItems: number,
    downloadFlag: boolean,
    disabled: boolean
}

export class DialogDownlodController {

    private _viewModel: {
        fileName: string,
        fileContent: FileDownloadContent[]
    } = {
        fileName: null,
        fileContent: []
    }

    constructor(
        private $mdDialog,
        private codeMapPreRenderService: CodeMapPreRenderService
    ) {
        this.initDialogFields()
    }

    private initDialogFields() {
        const file: CCFile = this.codeMapPreRenderService.getRenderFile()
        this._viewModel.fileName = FileNameHelper.getNewFileName(file.fileMeta.fileName)
        this.pushFileContent("nodes", hierarchy(file.map).descendants().length, true)

        _.keys(file.settings.fileSettings).forEach(settingsKey => {
            this.pushFileContent(settingsKey, file.settings.fileSettings[settingsKey].length)
        })
        this._viewModel.fileContent = this._viewModel.fileContent.sort()
    }

    private pushFileContent(name: string, numberOfListItems: number, disabled: boolean = false) {
        this._viewModel.fileContent.push({
            name: name,
            numberOfListItems: numberOfListItems,
            downloadFlag: numberOfListItems > 0,
            disabled: disabled || !numberOfListItems || numberOfListItems == 0
        })
    }

    public hide() {
        this.$mdDialog.hide();
    }

    public download() {
        FileDownloader.downloadCurrentMap(
            this.codeMapPreRenderService.getRenderFile(),
            this._viewModel.fileName
        )
        this.$mdDialog.hide();
    }

    
}

export const dialogDownlodComponent = {
    clickOutsideToClose: true,
    template: require("./dialog.download.html"),
    controller: DialogDownlodController,
    controllerAs: "$ctrl",
};