package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclarationNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ImportingDeclaration
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.MemberTypeScopes
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.ProjectNames
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeImportResolver

/** The name rules of `docs/name-resolution/java.md` and `kotlin.md`, which share one class path. */
internal object JavaNameRules : NameRules {
    private const val QUALIFIER_SEPARATOR = "."

    override fun namesOf(node: Node, project: ProjectNames): DeclarationNames {
        val ownPackage = project.packageOf(node.pathWithName)
        val resolver = TypeImportResolver(
            ImportingDeclaration(node.pathWithName, node.physicalPath, node.dependencies, node.language, ownPackage),
            project.projectDictionary,
            project.languageDictionary,
            project.fileScopedPaths
        )
        val imports = JavaImports(ownPackage, node.dependencies)
        val byImports = { name: String -> resolveByImports(name, resolver, imports, project) }
        val memberTypes = MemberTypeScopes.of(node, byImports, project)
        val qualifiedNames = QualifiedNames(byImports, resolver::resolveOwnName, memberTypes, project.internalNodePaths)
        return DeclarationNames { name ->
            when {
                name.contains(QUALIFIER_SEPARATOR) -> qualifiedNames.resolve(name)
                memberTypes.isOwnName(name) -> resolver.resolveOwnName(name)
                else -> memberTypes.memberNamed(name) ?: byImports(name)
            }
        }
    }

    // Rules 4 to 7: the full path as written, a single-type import, then the own package and the star imports
    private fun resolveByImports(name: String, resolver: TypeImportResolver, imports: JavaImports, project: ProjectNames): Path {
        val plainName = name.substringAfterLast(QUALIFIER_SEPARATOR)
        return resolver.fullyQualifiedOf(name)
            ?: resolver.directImportOf(plainName)
            ?: resolver.candidatesNamed(plainName)?.let { imports.find(it) }
            ?: project.languageDictionary[plainName]
            ?: Path.unknown(plainName)
    }
}
