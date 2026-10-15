package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms.StronglyConnectedComponentDetection
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

class CycleRuleEvaluator(private val rules: CycleRules) {
    fun evaluate(dependencies: List<FileDependency>, hasDependencyData: Boolean = true): List<Violation> {
        val hasCycleRule = rules.file != null || rules.packages != null
        if (hasCycleRule && !hasDependencyData) return listOf(cyclesNotChecked())
        val fileCycles = rules.file?.let { rule -> findCycles(dependencies, ViolationKind.FILE_CYCLE, rule) } ?: emptyList()
        val packageCycles =
            rules.packages?.let { rule -> findCycles(packageDependencies(dependencies), ViolationKind.PACKAGE_CYCLE, rule) } ?: emptyList()
        return fileCycles + packageCycles
    }

    private fun cyclesNotChecked() = Violation(
        ViolationKind.CYCLES_NOT_CHECKED,
        Severity.WARNING,
        "The map has no dependency data, so cycles could not be checked. Switch on the dependencyparser."
    )

    private fun findCycles(dependencies: List<FileDependency>, kind: ViolationKind, rule: CycleRule): List<Violation> {
        val considered = withoutIgnored(dependencies, PathPatterns(rule.ignore), kind == ViolationKind.PACKAGE_CYCLE)
        return StronglyConnectedComponentDetection()
            .run(toNodeInformations(considered))
            .map { component -> component.nodes.map { it.id }.toSet() }
            .filter { members -> members.size > 1 }
            .map { members -> toViolation(members, considered, kind, rule) }
            .sortedBy { it.members.first() }
    }

    private fun withoutIgnored(dependencies: List<FileDependency>, ignored: PathPatterns, areFolders: Boolean): List<FileDependency> =
        dependencies.filterNot { ignored.matches(it.from, areFolders) || ignored.matches(it.to, areFolders) }

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
