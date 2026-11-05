package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.sharedFolderCount
import de.maibornwolff.treesitter.excavationsite.api.VbaName
import de.maibornwolff.treesitter.excavationsite.api.VbaNameKind

/**
 * The lookup of `vba.md` for the names one module writes, ignoring case as the compiler does (decision 5): the own
 * module, then the modules and public names of the project, the nearest by folder of several, none on a tie (decision
 * 3). A module name followed by a member means that member; a form or report means its code module (decision 2). The
 * extractor has left out the names a local declaration hides.
 */
internal class VbaLookup(private val project: VbaProject, private val own: VbaModuleFile) {
    private sealed interface Target {
        val modules: List<VbaModuleFile>

        data class Declared(val path: List<String>, override val modules: List<VbaModuleFile>) : Target

        data class Module(override val modules: List<VbaModuleFile>) : Target
    }

    /** The logical path of the declaration [name] means, or null for a local, library, ambiguous or unknown name. */
    fun resolve(name: VbaName): List<String>? = when (name.kind) {
        VbaNameKind.FORM -> codeModuleOf(FORM_PREFIX + name.segments.first())
        VbaNameKind.REPORT -> codeModuleOf(REPORT_PREFIX + name.segments.first())
        VbaNameKind.CODE -> resolveCode(name.segments)
    }

    private fun codeModuleOf(moduleName: String): List<String>? {
        val codeModule = project.modulesNamed(moduleName).firstOrNull { it.isClass } ?: return null
        return listOf(codeModule.name)
    }

    private fun resolveCode(segments: List<String>): List<String>? {
        own.declarationNamed(segments.first())?.let { return own.pathOf(it) }
        return when (val target = nearestTarget(segments.first())) {
            is Target.Declared -> target.path
            is Target.Module -> memberOf(target.modules, segments.getOrNull(1))
            null -> null
        }
    }

    private fun nearestTarget(written: String): Target? {
        val moduleTarget = project.modulesNamed(written).takeIf { it.isNotEmpty() }?.let { Target.Module(it) }
        val declaredTargets = project
            .offersOf(written)
            .groupBy { offer -> offer.path.map { it.lowercase() } }
            .values
            .map { offers -> Target.Declared(offers.first().path, offers.map { it.module }) }
        val nearness = (listOfNotNull(moduleTarget) + declaredTargets).associateWith { nearnessOf(it) }
        val nearest = nearness.values.maxOrNull() ?: return null
        return nearness.filterValues { it == nearest }.keys.singleOrNull()
    }

    private fun nearnessOf(target: Target): Int = target.modules.maxOf { sharedFolderCount(it.filePath, own.filePath) }

    // A class means itself, whatever member follows: a form's default instance or a public enum of it.
    private fun memberOf(copies: List<VbaModuleFile>, member: String?): List<String>? {
        val module = copies.first()
        if (module.isClass) return listOf(module.name)
        if (member == null) return null
        val isOwnModule = module.name.equals(own.name, ignoreCase = true)
        val declaration = copies.firstNotNullOfOrNull { copy -> copy.declarationNamed(member)?.takeIf { isOwnModule || it.isPublic } }
        return declaration?.let { module.pathOf(it) }
    }

    companion object {
        private const val FORM_PREFIX = "Form_"
        private const val REPORT_PREFIX = "Report_"
    }
}
