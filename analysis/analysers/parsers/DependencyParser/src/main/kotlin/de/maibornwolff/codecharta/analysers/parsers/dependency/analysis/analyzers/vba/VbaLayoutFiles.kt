package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import de.maibornwolff.treesitter.excavationsite.api.VbaNameKind

/**
 * The form and report layouts of a run (`vba.md`, Access forms and reports): a `.form` or `.report` file is the layout
 * of the form or report named after its file, one leaf named after its file with the ending, its dots written as
 * underscores (`frmOrders_form`), as an Angular template is. The code module of a form is `Form_` plus its name.
 */
internal object VbaLayoutFiles {
    private const val FORM_SUFFIX = ".form"
    private const val REPORT_SUFFIX = ".report"
    private const val FORM_MODULE_PREFIX = "Form_"
    private const val REPORT_MODULE_PREFIX = "Report_"
    private val SEPARATORS = charArrayOf('/', '\\')

    fun isLayout(file: String): Boolean = kindOf(file) != null

    /** [VbaNameKind.FORM] or [VbaNameKind.REPORT] for a layout file, null for any other file. */
    fun kindOf(file: String): VbaNameKind? = when {
        file.endsWith(FORM_SUFFIX, ignoreCase = true) -> VbaNameKind.FORM
        file.endsWith(REPORT_SUFFIX, ignoreCase = true) -> VbaNameKind.REPORT
        else -> null
    }

    /** The name of the form or report, the file name without its ending. */
    fun objectNameOf(file: String): String = fileNameOf(file).substringBeforeLast('.')

    fun leafOf(file: String): List<String> = listOf(fileNameOf(file).replace('.', '_'))

    /** The name of the code module of the form or report [objectName] of [kind]. */
    fun moduleNameOf(objectName: String, kind: VbaNameKind): String = modulePrefixOf(kind) + objectName

    /** The form or report whose code module is [moduleName], null for a module of no form or report. */
    fun objectOfModule(moduleName: String): Pair<String, VbaNameKind>? = listOf(VbaNameKind.FORM, VbaNameKind.REPORT)
        .firstOrNull { moduleName.startsWith(modulePrefixOf(it), ignoreCase = true) }
        ?.let { kind -> moduleName.drop(modulePrefixOf(kind).length) to kind }

    private fun modulePrefixOf(kind: VbaNameKind): String = if (kind == VbaNameKind.FORM) FORM_MODULE_PREFIX else REPORT_MODULE_PREFIX

    private fun fileNameOf(file: String): String = file.substringAfterLast(SEPARATORS.first()).substringAfterLast(SEPARATORS.last())
}
