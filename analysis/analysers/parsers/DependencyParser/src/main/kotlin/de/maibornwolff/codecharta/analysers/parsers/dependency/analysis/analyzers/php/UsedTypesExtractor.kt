package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpClassQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpConstantsQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpFunctionQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.queries.PhpInstantiationQueries
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import org.treesitter.TSNode

class UsedTypesExtractor(private val aliasedTypes: Map<Type, Path>, private val dependencies: Set<DependencyWrapper>) {
    private val classQueries = PhpClassQueries()
    private val functionQueries = PhpFunctionQueries()
    private val constantQueries = PhpConstantsQueries()
    private val instantiationQueries = PhpInstantiationQueries()

    fun extract(node: TSNode, code: String): Set<Type> {
        val propertyTypes = classQueries.getUsedPropertyTypes(node)
        val inheritedTypes = classQueries.getInheritedTypes(node).map { mapType(it, code, TypeOfUsage.INHERITANCE) }.toSet()
        val implementedTypes = classQueries.getImplementedTypes(node).map { mapType(it, code, TypeOfUsage.IMPLEMENTATION) }.toSet()
        val typesOfInstantiations = instantiationQueries
            .getInstantiations(
                node
            ).map { mapType(it, code, TypeOfUsage.INSTANTIATION) }
            .toSet()
        val argumentTypes = functionQueries.getArgumentTypes(node).map { mapType(it, code, TypeOfUsage.ARGUMENT) }.toSet()
        val returnTypes = functionQueries.getReturnTypes(node).map { mapType(it, code, TypeOfUsage.RETURN_VALUE) }.toSet()
        val staticFunctionAccess = functionQueries.getStaticFunctionAccess(node)
        val constTypes = constantQueries.getClassAccessDeclaration(node).map { mapType(it, code, TypeOfUsage.CONSTANT_ACCESS) }.toSet()
        val usedTraitTypes = classQueries.getUsedTraitTypes(node)

        val nodeAsString = nodeAsString(node, code)
        val constantDependenciesUsedInNode = dependencies
            .asSequence()
            .filter { it.dependency.isWildcard.not() }
            .filter { it.isConstant }
            .map {
                it.dependency.path.parts
                    .last()
            }.filter { nodeAsString.contains(it) }
            .map { Type.simple(it, TypeOfUsage.CONSTANT_ACCESS) }
            .toSet()

        return constantDependenciesUsedInNode + inheritedTypes + implementedTypes + constTypes + returnTypes + argumentTypes +
            typesOfInstantiations +
            (propertyTypes + staticFunctionAccess + usedTraitTypes)
                .map {
                    mapType(it, code, TypeOfUsage.USAGE)
                }.toSet()
    }

    private fun mapType(node: TSNode, code: String, typeOfUsage: TypeOfUsage): Type {
        val typeName = nodeAsString(node, code)
        val type = Type.simple(typeName, typeOfUsage)
        return aliasedTypes[type]?.let {
            Type.simple(it.parts.last(), typeOfUsage)
        } ?: type
    }
}
