package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The names an import statement binds: `import a.b` binds `a` to the module `a`, `import a.b as m` binds `m` to the
 * module `a.b`, `from m import n as a` binds `a` to the name `n` of `m`, and `from m import *` binds the public names of
 * `m`, which has no single name.
 */
internal object ImportBindings {
    fun of(statement: SyntaxNode): List<NamedBinding> = ImportExtractor.importsOf(statement).map { import ->
        NamedBinding(bindingNameOf(import), bindingOf(import), statement.endByte)
    }

    private fun bindingNameOf(import: ImportDeclaration): String? = when {
        import.isWildcard -> null
        import.kind == ImportKind.MEMBER -> import.bindingName ?: import.path.last()
        else -> import.bindingName ?: import.path.first()
    }

    private fun bindingOf(import: ImportDeclaration): Binding = when {
        import.isWildcard -> Binding.Wildcard(import.path)
        import.kind == ImportKind.MEMBER -> Binding.ImportedName(import.path.dropLast(1), import.path.last())
        import.bindingName != null -> Binding.ImportedModule(import.path)
        else -> Binding.ImportedModule(import.path.take(1))
    }
}

/** A name a statement binds, from the byte [position] on; a wildcard import binds no single name. */
internal data class NamedBinding(val name: String?, val binding: Binding, val position: Int)
