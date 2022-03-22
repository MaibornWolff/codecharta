import { CcState } from "../../../state/store/store"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { filesSelector } from "../../../state/store/files/files.selector"
import { FileState } from "../../../model/files/files"

export type DownloadableConfigs = Map<string, number>

export const getDownloadableCustomViews = (files: FileState[]): DownloadableConfigs => {
	const downloadableConfigs: DownloadableConfigs = new Map([["test", files.length]])
	return downloadableConfigs
}

export const downloadableCustomConfigsSelector: (state: CcState) => DownloadableConfigs = createSelector(
	[filesSelector],
	getDownloadableCustomViews
)
