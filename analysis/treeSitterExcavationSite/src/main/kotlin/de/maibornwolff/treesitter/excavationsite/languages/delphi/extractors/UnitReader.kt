package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiScript
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiSection
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnit
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnitKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * Reads what a Delphi unit, program or library declares: its name, the entries of its `uses` clauses and the
 * declarations of each section, see [SectionReader]. A unit's `interface` and `implementation` sections are read
 * apart; a routine whose heading the interface declares and whose body the implementation holds is one declaration, and
 * the names of a method body belong to its type. A program's main block and a unit's `initialization` and
 * `finalization` with code in them are its script.
 */
internal object UnitReader {
    private const val INTERFACE = "interface"
    private const val IMPLEMENTATION = "implementation"
    private const val DECL_USES = "declUses"
    private const val MODULE_NAME = "moduleName"
    private const val IDENTIFIER = "identifier"
    private const val MAIN_BLOCK = "block"
    private const val INITIALIZATION = "initialization"
    private const val FINALIZATION = "finalization"
    private const val KEYWORD_PREFIX = "k"
    private const val SEPARATOR = ";"

    private val CONTAINERS = mapOf("unit" to DelphiUnitKind.UNIT, "program" to DelphiUnitKind.PROGRAM, "library" to DelphiUnitKind.LIBRARY)

    fun read(root: SyntaxNode): DelphiUnit {
        val name = PackageExtractor.extract(root)
        val container = containerOf(root) ?: return DelphiUnit(DelphiUnitKind.UNIT, name, emptyList(), emptyList(), emptyList())
        val kind = CONTAINERS.getValue(container.type)
        if (kind != DelphiUnitKind.UNIT) {
            val contents = listOf(SectionReader.read(container, DelphiSection.IMPLEMENTATION))
            return DelphiUnit(kind, name, emptyList(), usesOf(container), assembled(contents), scriptOf(container, MAIN_BLOCK))
        }
        val interfacePart = container.children().firstOrNull { it.type == INTERFACE }
        val implementationPart = container.children().firstOrNull { it.type == IMPLEMENTATION }
        val contents = listOfNotNull(
            interfacePart?.let { SectionReader.read(it, DelphiSection.INTERFACE) },
            implementationPart?.let { SectionReader.read(it, DelphiSection.IMPLEMENTATION) }
        )
        val interfaceUses = interfacePart?.let { usesOf(it) }.orEmpty()
        val implementationUses = implementationPart?.let { usesOf(it) }.orEmpty()
        val script = scriptOf(container, INITIALIZATION, FINALIZATION)
        return DelphiUnit(kind, name, interfaceUses, implementationUses, assembled(contents), script)
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

    private fun assembled(contents: List<SectionContents>): List<DelphiDeclaration> {
        val methodBodies = contents.flatMap { it.methodBodies }
        return onePerName(contents.flatMap { it.declarations }).map { withMethodBodies(it, methodBodies) }
    }

    // Overloads and a routine's interface heading with its implementation body declare one name; the first one counts.
    private fun onePerName(declarations: List<DelphiDeclaration>): List<DelphiDeclaration> = declarations
        .groupBy { identityOf(it) }
        .values
        .map { copies -> copies.first().copy(names = copies.flatMap { it.names }.distinct()) }

    private fun identityOf(declaration: DelphiDeclaration): List<Any> {
        if (declaration.kind == DelphiDeclarationKind.ROUTINE) return listOf(declaration.name)
        return listOf(declaration.name, declaration.kind, declaration.outerTypes)
    }

    private fun withMethodBodies(declaration: DelphiDeclaration, methodBodies: List<MethodBody>): DelphiDeclaration {
        val path = declaration.outerTypes + declaration.name
        val own = methodBodies.filter { isSamePath(it.ownerTypes, path) }
        if (own.isEmpty()) return declaration
        return declaration.copy(names = (declaration.names + own.flatMap { it.names }).distinct())
    }

    // A method body names its type as the compiler reads it, ignoring case.
    private fun isSamePath(written: List<String>, declared: List<String>): Boolean =
        written.size == declared.size && written.zip(declared).all { (part, declaredPart) -> part.equals(declaredPart, ignoreCase = true) }

    private fun scriptOf(container: SyntaxNode, vararg parts: String): DelphiScript? {
        val code = container.children().filter { it.type in parts }.toList()
        if (code.none { part -> part.children().any { isStatement(it) } }) return null
        val names = code.flatMap { NameCollector.namesIn(it, NamePlace(DelphiSection.IMPLEMENTATION, emptyList(), LocalNames.of(it))) }
        return DelphiScript(names.distinct())
    }

    // Keywords (`kBegin`, `kInitialization`) and separators are no code.
    private fun isStatement(node: SyntaxNode): Boolean = !node.type.startsWith(KEYWORD_PREFIX) && node.type != SEPARATOR
}
