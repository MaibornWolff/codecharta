import { MarkedPackage } from "../../../../../codeCharta.model"
import { getParent } from "../../../../../util/nodePathHelper"

export const addMarkedPackage = (markedPackagesMap: Map<string, MarkedPackage>, { path, color }: MarkedPackage) => {
    const directMarkedParentPackage = getParent(markedPackagesMap, path)

    if (!directMarkedParentPackage || directMarkedParentPackage.color !== color) {
        markedPackagesMap.set(path, {
            path,
            color
        })
    }

    for (const [key, markedPackage] of markedPackagesMap) {
        if (markedPackage.path === path) {
            if (markedPackage.color !== color) {
                markedPackagesMap.delete(key)
            }
        } else if (markedPackage.path.startsWith(path)) {
            // Remove marked packages with color identical to their parent marked package
            const markedPackageParent = getParent(markedPackagesMap, markedPackage.path)
            if (markedPackageParent && markedPackageParent.color === markedPackage.color) {
                markedPackagesMap.delete(key)
            }
        }
    }
}
