import packageJson from "../../../package.json"

const LATEST_ONE_X_API_VERSION = packageJson.codecharta.apiVersion

/**
 * getExportCCFile always emits the flat 1.x ExportCCFile shape (no 2.0 `meta`
 * envelope). A file loaded as cc.json 2.0 carries apiVersion "2.0" on its fileMeta; stamping the
 * flat shape "2.0" makes the 1.x loader reject it (majorApiVersionIsOutdated) on the next start, so
 * the map is silently replaced by sample files. Clamp any major >= 2 origin down to the latest 1.x
 * version the viz actually writes, leaving genuine 1.x versions untouched.
 */
export function toExportApiVersion(originApiVersion: string): string {
    const major = Number(originApiVersion?.split(".")[0])
    return Number.isFinite(major) && major >= 2 ? LATEST_ONE_X_API_VERSION : originApiVersion
}
