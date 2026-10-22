package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java.JavaNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

fun Node.Companion.build(
    pathWithName: Path = Path(listOf("")),
    physicalPath: String = "",
    nodeType: NodeType = NodeType.CLASS,
    language: SupportedLanguage = SupportedLanguage.JAVA,
    dependencies: Set<Dependency> = setOf(),
    usedTypes: Set<Type> = setOf(),
    resolvedNodeDependencies: NodeDependencies = NodeDependencies(setOf(), setOf()),
    angular: AngularMetadata? = null
): Node = Node(
    pathWithName = pathWithName,
    physicalPath = physicalPath,
    nodeType = nodeType,
    language = language,
    dependencies = dependencies,
    usedTypes = usedTypes,
    resolvedNodeDependencies = resolvedNodeDependencies,
    angular = angular
)

/** Resolves a Java or Kotlin node by the rules production uses for it. */
fun Node.resolveJavaTypes(
    projectDictionary: Map<String, List<Path>>,
    languageDictionary: Map<String, Path>,
    internalNodePaths: Set<String>
): Node = resolveTypes(projectDictionary, languageDictionary, internalNodePaths, nameRules = JavaNameRules)
