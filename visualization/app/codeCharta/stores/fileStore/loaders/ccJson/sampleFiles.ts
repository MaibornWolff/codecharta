import sample1 from "../../../../assets/sample1.cc.json"
import sample2 from "../../../../assets/sample2.cc.json"
import { CcJson2 } from "../../../../model/ccjson2.model"

// The bundled first-run sample files, now real cc.json 2.0 ({ meta, files, lenses }) produced by
// `ccsh convert`. They are cast to the 2.0 domain type (CcJson2) — the JSON import infers a widened
// `type: string`, so the double cast through `unknown` is required. The load orchestrator + the reset
// dialog consume them through fileStore.facade, and the loader routes them through the SAME 2.0 reader
// as a user upload, so first-run exercises the 2.0 path. The display fileName stays "*.cc.json".
export const sampleFile1 = { fileName: "sample1.cc.json", fileSize: 3 * 1024, content: sample1 as unknown as CcJson2 }
export const sampleFile2 = { fileName: "sample2.cc.json", fileSize: 2 * 1024, content: sample2 as unknown as CcJson2 }
