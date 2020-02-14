import { APIVersions, ExportCCFile, ExportCCFile_0_1, ExportCCFileAPI } from "../../codeCharta.api.model"

export function migrate(file: ExportCCFileAPI): ExportCCFile {
	switch (file.apiVersion) {
		case APIVersions.ZERO_POINT_ONE:
			return migrateTo1_0(file as ExportCCFile_0_1)
		default:
			return file
	}
}

function migrateTo1_0(file: ExportCCFile_0_1): ExportCCFile {
	delete file.fileName
	return file
}
