import sample1 from "../../../../assets/sample1.cc.json"
import sample2 from "../../../../assets/sample2.cc.json"
import { ExportCCFile } from "../../../../model/codeCharta.api.model"

// The bundled sample cc.json files. They cast the imported JSON to the wire DTO (ExportCCFile), so they
// stay inside the fileStore ingestion boundary (wire-dto-only-in-filestore-boundary). The load
// orchestrator + the reset dialog consume them through fileStore.facade.
export const sampleFile1 = { fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as ExportCCFile }
export const sampleFile2 = { fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as ExportCCFile }
