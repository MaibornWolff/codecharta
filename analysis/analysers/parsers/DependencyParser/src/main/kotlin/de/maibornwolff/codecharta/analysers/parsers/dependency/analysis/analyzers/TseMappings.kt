package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType

// The sentinel name TSE assigns to default export declarations (e.g. `export default ...`)
const val TSE_DEFAULT_EXPORT_NAME = "DEFAULT_EXPORT"

// The sentinel name TSE assigns to wildcard re-export declarations (e.g. `export * from '...'`)
const val WILDCARD_EXPORT_NAME = "*"

fun ImportDeclaration.toDependency(): Dependency = Dependency(path = Path(path), isWildcard = isWildcard)

// TSE represents a default import (`import Foo from './bar'`) as the module path plus a DEFAULT_EXPORT
// marker, while the default-exported declaration is keyed by its real name (`Foo`). Substituting the
// local binding name for the marker lets the dependency resolve to that declaration instead of dangling
// on an unmatchable DEFAULT_EXPORT segment. Falls back to the raw path when there is no binding name.
fun ImportDeclaration.defaultImportPath(): List<String> {
    val binding = bindingName
    if (binding != null && path.lastOrNull() == TSE_DEFAULT_EXPORT_NAME) {
        return path.dropLast(1) + binding
    }
    return path
}

fun UsedType.toType(): Type {
    if (genericTypes.isEmpty()) {
        return Type.simple(name)
    }
    return Type.generic(name, genericTypes.map { it.toType() })
}

fun DeclarationType.toNodeType(): NodeType = when (this) {
    DeclarationType.CLASS, DeclarationType.RECORD -> NodeType.CLASS
    DeclarationType.INTERFACE -> NodeType.INTERFACE
    DeclarationType.ENUM -> NodeType.ENUM
    DeclarationType.ANNOTATION -> NodeType.ANNOTATION
    DeclarationType.FUNCTION -> NodeType.FUNCTION
    DeclarationType.VARIABLE -> NodeType.VARIABLE
    DeclarationType.REEXPORT -> NodeType.REEXPORT
    DeclarationType.UNKNOWN -> NodeType.UNKNOWN
}
