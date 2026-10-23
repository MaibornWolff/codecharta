package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind

/** The name an import binds in its module: a default or namespace import its binding, `import { A }` the name `A`. */
internal fun ImportDeclaration.boundName(): String? = when {
    bindingName != null -> bindingName
    kind == ImportKind.MEMBER && !isWildcard -> path.lastOrNull()
    else -> null
}
