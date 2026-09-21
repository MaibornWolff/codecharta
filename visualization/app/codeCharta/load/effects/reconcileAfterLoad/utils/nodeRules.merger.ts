import { CCFile, ExcludedNode, FlattenedNode, ImportedNodeRule } from "../../../../model/codeCharta.model"
import { getUpdatedRulePath } from "../../../../util/nodePathHelper"

/**
 * The node rules the loaded files carried, split into the two lists the app keeps them in. A cc.json
 * states both in one typed list, which is why the split happens here rather than in the loader.
 */
export function getMergedNodeRules(inputFiles: CCFile[], withUpdatedPath: boolean) {
    const rulesByKey: Map<string, ImportedNodeRule> = new Map()

    for (const inputFile of inputFiles) {
        for (const importedRule of inputFile.settings.fileSettings.blacklist ?? []) {
            const path =
                withUpdatedPath && inputFiles.length > 1
                    ? getUpdatedRulePath(inputFile.fileMeta.fileName, importedRule.path)
                    : importedRule.path
            rulesByKey.set(`${path}|${importedRule.type}`, { path, type: importedRule.type })
        }
    }

    const excludedNodes: ExcludedNode[] = []
    const flattenedNodes: FlattenedNode[] = []
    for (const { path, type } of rulesByKey.values()) {
        const target = type === "flatten" ? flattenedNodes : excludedNodes
        target.push({ path })
    }
    return { excludedNodes, flattenedNodes }
}
