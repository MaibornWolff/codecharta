import { Inject, Injectable } from "@angular/core"
import { CodeChartaService } from "../../../codeCharta.service"
import { Store } from "../../../state/angular-redux/store"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { CustomConfigHelper, CUSTOM_CONFIG_FILE_EXTENSION } from "../../../util/customConfigHelper"
import { getCCFileAndDecorateFileChecksum } from "../../../util/fileHelper"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"
import { readFiles } from "../../../util/uploadFiles/readFiles"

@Injectable()
export class UploadFilesService {
	isUploading = false

	constructor(@Inject(Store) private store: Store) {}

	uploadFiles() {
		const ccFileInput = createCCFileInput()
		ccFileInput.addEventListener("change", async () => {
			try {
				this.isUploading = true
				this.store.dispatch(setIsLoadingFile(true))
				this.store.dispatch(setIsLoadingMap(true))

				const plainFileContents = await Promise.all(readFiles(ccFileInput.files))
				const { customConfigs, ccFiles } = this.splitCustomConfigsAndCCFiles(ccFileInput.files, plainFileContents)

				for (const customConfig of customConfigs) {
					CustomConfigHelper.importCustomConfigs(customConfig)
				}

				if (ccFiles.length > 0) {
					await CodeChartaService.instance.loadFiles(ccFiles)
				}
			} catch {
				this.store.dispatch(setIsLoadingFile(false))
				this.store.dispatch(setIsLoadingMap(false))
			} finally {
				this.isUploading = false
			}
		})
		ccFileInput.click()
	}

	private splitCustomConfigsAndCCFiles(fileList: FileList, contents: string[]) {
		const customConfigs = []
		const ccFiles = []

		for (const [index, content] of contents.entries()) {
			const fileName = fileList[index].name
			if (fileName.includes(CUSTOM_CONFIG_FILE_EXTENSION)) {
				customConfigs.push(content)
			} else {
				ccFiles.push({
					fileName,
					fileSize: fileList[index].size,
					content: getCCFileAndDecorateFileChecksum(content)
				})
			}
		}

		return { customConfigs, ccFiles }
	}
}
