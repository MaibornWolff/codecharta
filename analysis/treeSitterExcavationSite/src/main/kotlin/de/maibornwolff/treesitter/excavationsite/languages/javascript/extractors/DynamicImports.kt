package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The dynamic imports of a module, by decision 4 of `docs/name-resolution/typescript.md`: `import('./m')` loads the
 * module `m` later, bound to a name of its own, as a namespace import binds one, so that what is read from its result
 * is a name through that binding.
 */
internal object DynamicImports {
    private const val BINDING_PREFIX = "dynamic_import_"

    /** The name the module of the dynamic import [importCall] is bound to: unique in its file by the call's position. */
    fun bindingNameOf(importCall: SyntaxNode): String = BINDING_PREFIX + importCall.startByte
}
