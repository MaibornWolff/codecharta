package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

fun Node.Companion.build(
    pathWithName: Path = Path(listOf("")),
    physicalPath: String = "",
    nodeType: NodeType = NodeType.CLASS,
    language: SupportedLanguage = SupportedLanguage.JAVA,
    dependencies: Set<Dependency> = setOf(),
    usedTypes: Set<Type> = setOf(),
    resolvedNodeDependencies: NodeDependencies = NodeDependencies(setOf(), setOf())
): Node = Node(
    pathWithName = pathWithName,
    physicalPath = physicalPath,
    nodeType = nodeType,
    language = language,
    dependencies = dependencies,
    usedTypes = usedTypes,
    resolvedNodeDependencies = resolvedNodeDependencies
)
