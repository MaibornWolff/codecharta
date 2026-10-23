package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import java.io.File

/**
 * The imports of one file that name a member of a project module, by "What an import binds" of
 * `docs/name-resolution/typescript.md`: `import D from './m'` binds `D` to the default export of `m`, `import { A }` to
 * the declaration `m` exports as `A`, so a use is written as the full path of that declaration where it is not the
 * module path plus the imported name.
 */
internal class MemberImports(private val analysisRoot: File) {
    private val exports = ModuleExports.of(analysisRoot)
    private val targetByBinding = HashMap<String, Target>()

    /** The declaration a member import of [moduleFile] means, null where it is the module path plus the imported name. */
    fun targetOf(import: ImportDeclaration, moduleFile: File, module: Path): Path? {
        val boundModule = boundModuleOf(import, moduleFile)
        if (boundModule != null) {
            import.bindingName?.let { targetByBinding[it] = moduleTarget(boundModule) }
            return null
        }
        if (!ImportedModules.namesMember(import)) return null
        val importedName = import.path.lastOrNull() ?: return null
        if (importedName == TSE_DEFAULT_EXPORT_NAME) {
            val target = defaultOf(moduleFile, module) ?: return null
            import.bindingName?.let { targetByBinding[it] = Target(target, moduleFile = null) }
            return target
        }
        val ownName = exports.nameOf(moduleFile, importedName)
        if (ownName == importedName) return null
        // The extractor writes a use of a renamed import under the imported name, `Model` for `import { Model as Base }`
        return (module + ownName).also { targetByBinding[importedName] = Target(it, moduleFile = null) }
    }

    // `import * as ns` binds the module itself, `import { shapes }` the module it exports by `export * as shapes`
    private fun boundModuleOf(import: ImportDeclaration, moduleFile: File): File? {
        if (import.isWildcard && import.kind == ImportKind.STANDARD) return moduleFile
        if (import.isWildcard || import.kind != ImportKind.MEMBER) return null
        return import.path.lastOrNull()?.let { exports.moduleExportOf(moduleFile, it) }
    }

    private fun moduleTarget(moduleFile: File) = Target(ImportedModules.logicalPathOf(moduleFile, analysisRoot), moduleFile)

    /** The nodes with each use of an imported binding written as the full path of what it names. */
    fun rewrite(nodes: List<Node>): List<Node> {
        if (targetByBinding.isEmpty()) return nodes
        return nodes.map { node -> node.copy(usedTypes = node.usedTypes.mapTo(LinkedHashSet()) { rewrite(it) }) }
    }

    // `Geo.Circle` behind `import Geo` means the member `Circle` of what `Geo` names, else the longest prefix down to a
    // declaration: `Geo` itself, or the export `ns.Shapes` behind `import * as ns`, as a module is no declaration
    private fun rewrite(type: Type): Type {
        val genericTypes = type.genericTypes.map { rewrite(it) }
        val segments = type.name.split(SEPARATOR)
        val binding = targetByBinding[segments.first()] ?: return type.copy(genericTypes = genericTypes)
        val (target, members) = throughModuleExports(binding, segments.drop(1))
        val path = target.path + Path(members)
        if (path.parts.size < target.shortestDeclarationPath) return type.copy(genericTypes = genericTypes)
        val prefixes = (path.parts.size downTo target.shortestDeclarationPath).map { Path(path.parts.take(it)).withDots() }
        return type.copy(name = prefixes.first(), genericTypes = genericTypes, fallbacks = prefixes.drop(1).map { Type.simple(it) })
    }

    // `ns.shapes.Circle` behind `export * as shapes` walks on into that module: its member `Circle`
    private tailrec fun throughModuleExports(target: Target, members: List<String>): Pair<Target, List<String>> {
        val exportedModule = members.firstOrNull()?.let { name -> target.moduleFile?.let { exports.moduleExportOf(it, name) } }
            ?: return target to members
        return throughModuleExports(moduleTarget(exportedModule), members.drop(1))
    }

    private fun defaultOf(moduleFile: File, module: Path): Path? {
        if (moduleFile.name.endsWith(VUE_ENDING)) return module
        return exports.defaultNameOf(moduleFile)?.let { module + it }
    }

    /** What a binding names: a declaration, or the module [moduleFile] when it binds a module. */
    private class Target(val path: Path, val moduleFile: File?) {
        // A module is no declaration, so only a name below it is one
        val shortestDeclarationPath = path.parts.size + if (moduleFile != null) 1 else 0
    }

    companion object {
        private const val VUE_ENDING = ".vue"
        private const val SEPARATOR = "."
    }
}
