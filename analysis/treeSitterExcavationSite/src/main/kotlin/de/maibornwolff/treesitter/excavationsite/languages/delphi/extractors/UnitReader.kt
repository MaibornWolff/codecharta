package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiSection
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnit
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnitKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * Reads what a Delphi unit, program or library declares: its name, the entries of its `uses` clauses and the
 * declarations of each section, see [SectionReader]. A unit's `interface` and `implementation` sections are read
 * apart; a routine whose heading the interface declares and whose body the implementation holds is one declaration.
 */
internal object UnitReader {
    private const val INTERFACE = "interface"
    private const val IMPLEMENTATION = "implementation"
    private const val DECL_USES = "declUses"
    private const val MODULE_NAME = "moduleName"
    private const val IDENTIFIER = "identifier"

    private val CONTAINERS = mapOf("unit" to DelphiUnitKind.UNIT, "program" to DelphiUnitKind.PROGRAM, "library" to DelphiUnitKind.LIBRARY)

    fun read(root: SyntaxNode): DelphiUnit {
        val name = PackageExtractor.extract(root)
        val container = containerOf(root) ?: return DelphiUnit(DelphiUnitKind.UNIT, name, emptyList(), emptyList(), emptyList())
        val kind = CONTAINERS.getValue(container.type)
        if (kind != DelphiUnitKind.UNIT) {
            return DelphiUnit(kind, name, emptyList(), usesOf(container), SectionReader.read(container, DelphiSection.IMPLEMENTATION))
        }
        val interfacePart = container.children().firstOrNull { it.type == INTERFACE }
        val implementationPart = container.children().firstOrNull { it.type == IMPLEMENTATION }
        val declarations = interfacePart?.let { SectionReader.read(it, DelphiSection.INTERFACE) }.orEmpty() +
            implementationPart?.let { SectionReader.read(it, DelphiSection.IMPLEMENTATION) }.orEmpty()
        val interfaceUses = interfacePart?.let { usesOf(it) }.orEmpty()
        val implementationUses = implementationPart?.let { usesOf(it) }.orEmpty()
        return DelphiUnit(kind, name, interfaceUses, implementationUses, onePerName(declarations))
    }

    private fun containerOf(root: SyntaxNode): SyntaxNode? = root.children().firstOrNull { it.type in CONTAINERS }
        ?: TreeTraversal.findAllDescendantsOfType(root, *CONTAINERS.keys.toTypedArray()).firstOrNull()

    private fun usesOf(part: SyntaxNode): List<List<String>> = part
        .children()
        .filter { it.type == DECL_USES }
        .flatMap { uses -> uses.children().filter { it.type == MODULE_NAME } }
        .map { module -> module.children().filter { it.type == IDENTIFIER }.map { it.text }.toList() }
        .filter { it.isNotEmpty() }
        .toList()

    // Overloads and a routine's interface heading with its implementation body declare one name; the first one counts.
    private fun onePerName(declarations: List<DelphiDeclaration>): List<DelphiDeclaration> = declarations.distinctBy { identityOf(it) }

    private fun identityOf(declaration: DelphiDeclaration): List<Any> {
        if (declaration.kind == DelphiDeclarationKind.ROUTINE) return listOf(declaration.name)
        return listOf(declaration.name, declaration.kind, declaration.outerTypes)
    }
}
