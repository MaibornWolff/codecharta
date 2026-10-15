package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.algorithms.StronglyConnectedComponentDetection
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

class CycleRuleEvaluator(private val rules: CycleRules) {
    fun evaluate(dependencies: List<FileDependency>, hasDependencyAnalysis: Boolean = true): List<Violation> {
        val hasDependencyRule = rules.file != null || rules.upward != null
        if (hasDependencyRule && !hasDependencyAnalysis) return listOf(dependenciesNotChecked())
        val fileCycles = rules.file?.let { rule -> findFileCycles(dependencies, rule) } ?: emptyList()
        val upwardDependencies = rules.upward?.let { rule -> findUpwardDependencies(dependencies, rule) } ?: emptyList()
        return fileCycles + upwardDependencies
    }

    private fun dependenciesNotChecked() = Violation(
        ViolationKind.CYCLES_NOT_CHECKED,
        Severity.WARNING,
        "The map has no dependency analysis, so cycles and upward dependencies could not be checked. " +
            "Switch on the dependencyparser and leave out its --omit-graph-analysis."
    )

    private fun findFileCycles(dependencies: List<FileDependency>, rule: CycleRule): List<Violation> {
        val cyclicDependencies = withoutIgnored(dependencies.filter { it.isCyclic }, rule)
        return StronglyConnectedComponentDetection()
            .run(toNodeInformations(cyclicDependencies))
            .map { component -> component.nodes.map { it.id }.toSet() }
            .filter { members -> members.size > 1 }
            .map { members -> toFileCycle(members, cyclicDependencies, rule) }
            .sortedBy { it.members.first() }
    }

    private fun findUpwardDependencies(dependencies: List<FileDependency>, rule: CycleRule): List<Violation> =
        withoutIgnored(dependencies.filter { it.isPointingUpwards }, rule)
            .sortedWith(compareBy({ it.from }, { it.to }))
            .map { Violation(ViolationKind.UPWARD_DEPENDENCY, rule.severity, rule.instruction, path = it.from, target = it.to) }

    private fun withoutIgnored(dependencies: List<FileDependency>, rule: CycleRule): List<FileDependency> {
        val ignored = PathPatterns(rule.ignore)
        return dependencies.filterNot { ignored.matches(it.from) || ignored.matches(it.to) }
    }

    private fun toFileCycle(members: Set<String>, dependencies: List<FileDependency>, rule: CycleRule): Violation {
        val dependenciesInCycle = dependencies
            .filter { it.from in members && it.to in members }
            .groupBy({ it.from }, { it.to })
            .mapValues { (_, targets) -> targets.distinct().sorted() }
            .toSortedMap()
        return Violation(
            ViolationKind.FILE_CYCLE,
            rule.severity,
            rule.instruction,
            members = members.sorted(),
            dependencies = dependenciesInCycle
        )
    }

    private fun toNodeInformations(dependencies: List<FileDependency>): Set<NodeInformation> {
        val targetsBySource = dependencies.groupBy({ it.from }, { it.to })
        val allNodes = dependencies.flatMap { listOf(it.from, it.to) }.toSet()
        return allNodes.map { node -> NodeInformation(node, targetsBySource[node]?.toSet() ?: emptySet()) }.toSet()
    }
}
