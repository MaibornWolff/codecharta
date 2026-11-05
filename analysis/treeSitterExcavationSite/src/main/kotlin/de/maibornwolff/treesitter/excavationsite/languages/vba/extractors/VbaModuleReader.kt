package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaModule
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaModuleKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Reads what a VBA or VB6 module declares: its `VB_Name`, whether a `VERSION` header makes it a class, and its
 * module-level declarations, see [VbaDeclarationReader]. The declarations in every branch of an `#If` count, as both
 * are in the source; what the module writes outside them belongs to the module.
 */
internal object VbaModuleReader {
    private const val VERSION_HEADER = "frm_version_statement"
    private const val ATTRIBUTE = "attribute_statement"
    private const val MODULE_NAME_ATTRIBUTE = "VB_Name"
    private const val NAME_FIELD = "name"
    private const val VALUE_FIELD = "value"
    private const val QUOTE = "\""

    fun read(root: SyntaxNode): VbaModule {
        val items = VbaConditionalCode.itemsOf(root)
        val kind = if (items.any { it.type == VERSION_HEADER }) VbaModuleKind.CLASS else VbaModuleKind.STANDARD
        val declarations = items.flatMap { VbaDeclarationReader.read(it) }
        val outsideDeclarations = items.filterNot { VbaDeclarationReader.isDeclaration(it) }
        val moduleNames = outsideDeclarations.flatMap { VbaNameCollector.namesIn(it, VbaLocalNames.MODULE) }
        return VbaModule(nameOf(items), kind, onePerName(declarations), moduleNames.distinct())
    }

    private fun nameOf(items: List<SyntaxNode>): String = items
        .filter { it.type == ATTRIBUTE }
        .firstOrNull { it.getChildByFieldName(NAME_FIELD).orNull()?.text.equals(MODULE_NAME_ATTRIBUTE, ignoreCase = true) }
        ?.getChildByFieldName(VALUE_FIELD)
        ?.orNull()
        ?.text
        ?.removeSurrounding(QUOTE)
        .orEmpty()

    // The Get, Let and Set of a property, and a declaration in two branches of an `#If`, declare one name.
    private fun onePerName(declarations: List<VbaDeclaration>): List<VbaDeclaration> = declarations
        .groupBy { it.name.lowercase() }
        .values
        .map { copies ->
            copies.first().copy(
                isPublic = copies.any { it.isPublic },
                members = copies.flatMap { it.members }.distinct(),
                names = copies.flatMap { it.names }.distinct()
            )
        }
}
