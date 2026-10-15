package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.CycleRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity

class CycleRuleEvaluator(private val rules: CycleRules) {
    fun evaluate(analysis: DependencyAnalysis?): List<Violation> {
        val hasDependencyRule = rules.betweenFiles != null || rules.insideFiles != null || rules.upward != null
        if (!hasDependencyRule) return emptyList()
        if (analysis == null) return listOf(dependenciesNotChecked())
        val chains = findCycleChains(analysis.declarationDependencies)
        return cycles(chains, rules.betweenFiles, ViolationKind.CYCLE_BETWEEN_FILES) +
            cycles(chains, rules.insideFiles, ViolationKind.CYCLE_INSIDE_FILE) +
            upwardDependencies(analysis, rules.upward)
    }

    private fun dependenciesNotChecked() = Violation(
        ViolationKind.CYCLES_NOT_CHECKED,
        Severity.WARNING,
        "The map has no dependency analysis, so cycles and upward dependencies could not be checked. " +
            "Switch on the dependencyparser and leave out its --omit-graph-analysis."
    )

    private fun cycles(chains: List<CycleChain>, rule: CycleRule?, kind: ViolationKind): List<Violation> {
        if (rule == null) return emptyList()
        val ignored = PathPatterns(rule.ignore)
        val isBetweenFiles = kind == ViolationKind.CYCLE_BETWEEN_FILES
        return chains
            .map { chain -> chain.map { it.from } }
            .filter { declarations -> (declarations.map { it.file }.distinct().size > 1) == isBetweenFiles }
            .filterNot { declarations -> declarations.any { ignored.matches(it.file) } }
            .map { declarations -> toCycle(declarations, kind, rule) }
            .sortedBy { it.declarations.joinToString { declaration -> "${declaration.file}/${declaration.name}" } }
    }

    private fun toCycle(declarations: List<Declaration>, kind: ViolationKind, rule: CycleRule): Violation {
        val files = declarations.map { it.file }.distinct().sorted()
        val path = if (kind == ViolationKind.CYCLE_INSIDE_FILE) files.single() else null
        return Violation(kind, rule.severity, rule.instruction, path = path, members = files, declarations = declarations)
    }

    private fun upwardDependencies(analysis: DependencyAnalysis, rule: CycleRule?): List<Violation> {
        if (rule == null) return emptyList()
        val ignored = PathPatterns(rule.ignore)
        return analysis.declarationDependencies
            .filter { isUpward(it, analysis.upwardOfFilePair) }
            .filterNot { ignored.matches(it.from.file) || ignored.matches(it.to.file) }
            .sortedWith(compareBy({ it.from.file }, { it.from.name }, { it.to.file }, { it.to.name }))
            .map { toUpwardDependency(it, rule) }
    }

    private fun toUpwardDependency(dependency: DeclarationDependency, rule: CycleRule) = Violation(
        ViolationKind.UPWARD_DEPENDENCY,
        rule.severity,
        rule.instruction,
        path = dependency.from.file,
        target = dependency.to.file,
        declarations = listOf(dependency.from, dependency.to)
    )
}
