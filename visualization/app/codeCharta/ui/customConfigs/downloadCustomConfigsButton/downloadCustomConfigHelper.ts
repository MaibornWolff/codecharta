import { ExportCustomConfig } from "../../../model/customConfig/customConfig.api.model"
import { FileNameHelper } from "../../../util/fileNameHelper"
import { FileDownloader } from "../../../util/fileDownloader"
import { stateObjectReplacer } from "../../../codeCharta.model"

interface CustomConfigsDownloadFile {
    downloadApiVersion: string
    timestamp: number
    customConfigs: Map<string, ExportCustomConfig>
}

const CUSTOM_CONFIG_FILE_EXTENSION = ".cc.config.json"
const CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION = "1.0.1"

export function downloadCustomConfigs(customConfigs: Map<string, ExportCustomConfig>) {
    const customConfigsDownloadFile: CustomConfigsDownloadFile = {
        downloadApiVersion: CUSTOM_CONFIGS_DOWNLOAD_FILE_VERSION,
        timestamp: Date.now(),
        customConfigs
    }

    const fileName = FileNameHelper.getNewTimestamp() + CUSTOM_CONFIG_FILE_EXTENSION
    FileDownloader.downloadData(JSON.stringify(customConfigsDownloadFile, stateObjectReplacer), fileName)
}
