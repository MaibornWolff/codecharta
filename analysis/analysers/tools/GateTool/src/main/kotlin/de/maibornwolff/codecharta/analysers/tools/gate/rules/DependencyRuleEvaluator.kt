package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

class DependencyRuleEvaluator(private val rules: DependencyRules) {
    fun evaluate(analysis: DependencyAnalysis?): List<Violation> {
        val hasDependencyRule = rules.cyclesBetweenFiles != null || rules.cyclesInsideFiles != null || rules.upward != null
        if (!hasDependencyRule) return emptyList()
        if (analysis == null) return listOf(dependenciesNotChecked())
        val chains = findCycleChains(analysis.declarationDependencies)
        val cycles = chains.map { chain -> chain.map { it.from } }
        return cycles(cycles.filterNot(::isInsideOneFile), rules.cyclesBetweenFiles) +
            cycles(cycles.filter(::isInsideOneFile), rules.cyclesInsideFiles) +
            upwardDependencies(analysis, rules.upward)
    }

    private fun dependenciesNotChecked() = DependenciesNotChecked(
        Severity.WARNING,
        "Cycles and upward dependencies could not be checked: the map has no dependency analysis. The dependencyparser " +
            "is switched off, found no source code it supports, or ran with --omit-graph-analysis."
    )

    private fun isInsideOneFile(declarations: List<Declaration>): Boolean = declarations.map { it.file }.distinct().size == 1

    private fun cycles(cycles: List<List<Declaration>>, rule: DependencyRule?): List<Violation> {
        if (rule == null) return emptyList()
        val ignored = PathPatterns(rule.ignore)
        return cycles
            .filterNot { declarations -> declarations.any { ignored.matches(it.file) } }
            .map { declarations -> CycleViolation(rule.severity, rule.instruction, declarations) }
            .sortedBy { cycle -> cycle.declarations.joinToString { "${it.file}/${it.name}" } }
    }

    private fun upwardDependencies(analysis: DependencyAnalysis, rule: DependencyRule?): List<Violation> {
        if (rule == null) return emptyList()
        val ignored = PathPatterns(rule.ignore)
        return analysis.declarationDependencies
            .filter { isUpward(it, analysis.upwardOfFilePair) }
            .filterNot { ignored.matches(it.from.file) || ignored.matches(it.to.file) }
            .sortedWith(compareBy({ it.from.file }, { it.from.name }, { it.to.file }, { it.to.name }))
            .map { toUpwardDependency(it, rule) }
    }

    private fun toUpwardDependency(dependency: DeclarationDependency, rule: DependencyRule) =
        UpwardViolation(rule.severity, rule.instruction, dependency.from, dependency.to)
}
