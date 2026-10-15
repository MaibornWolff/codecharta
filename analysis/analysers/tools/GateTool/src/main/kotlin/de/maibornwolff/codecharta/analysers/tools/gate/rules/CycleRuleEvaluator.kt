package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms.StronglyConnectedComponentDetection
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRules

class CycleRuleEvaluator(private val rules: CycleRules) {
    fun evaluate(dependencies: List<FileDependency>): List<Violation> {
        val fileCycles = rules.file?.let { rule -> findCycles(dependencies, ViolationKind.FILE_CYCLE, rule) } ?: emptyList()
        val packageCycles =
            rules.packages?.let { rule -> findCycles(packageDependencies(dependencies), ViolationKind.PACKAGE_CYCLE, rule) } ?: emptyList()
        return fileCycles + packageCycles
    }

    private fun findCycles(dependencies: List<FileDependency>, kind: ViolationKind, rule: CycleRule): List<Violation> =
        StronglyConnectedComponentDetection()
            .run(toNodeInformations(dependencies))
            .map { component -> component.nodes.map { it.id }.toSet() }
            .filter { members -> members.size > 1 && members !in rules.allowed }
            .map { members -> toViolation(members, dependencies, kind, rule) }
            .sortedBy { it.members.first() }

    private fun toViolation(members: Set<String>, dependencies: List<FileDependency>, kind: ViolationKind, rule: CycleRule): Violation {
        val dependenciesInCycle = dependencies
            .filter { it.from in members && it.to in members }
            .groupBy({ it.from }, { it.to })
            .mapValues { (_, targets) -> targets.distinct().sorted() }
            .toSortedMap()
        return Violation(kind, rule.severity, rule.instruction, members = members.sorted(), dependencies = dependenciesInCycle)
    }

    private fun toNodeInformations(dependencies: List<FileDependency>): Set<NodeInformation> {
        val targetsBySource = dependencies.groupBy({ it.from }, { it.to })
        val allNodes = dependencies.flatMap { listOf(it.from, it.to) }.toSet()
        return allNodes.map { node -> NodeInformation(node, targetsBySource[node]?.toSet() ?: emptySet()) }.toSet()
    }

    private fun packageDependencies(dependencies: List<FileDependency>): List<FileDependency> = dependencies
        .map { FileDependency(packageOf(it.from), packageOf(it.to)) }
        .filter { it.from != it.to }
        .distinct()

    private fun packageOf(path: String): String = path.substringBeforeLast(PATH_SEPARATOR, TOP_FOLDER)

    companion object {
        private const val PATH_SEPARATOR = "/"
        private const val TOP_FOLDER = "."
    }
}
