package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.tools.gate.config.ConfigKeys
import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRule
import de.maibornwolff.codecharta.analysers.tools.gate.config.DependencyRules
import de.maibornwolff.codecharta.analysers.tools.gate.config.Severity
import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.childPath

class DependencyRuleEvaluator(private val rules: DependencyRules) {
    fun evaluate(analysis: DependencyAnalysis?): List<Violation> {
        val hasDependencyRule = rules.cyclesBetweenFiles != null || rules.cyclesInsideFiles != null || rules.upward != null
        if (!hasDependencyRule) return emptyList()
        if (analysis == null) return listOf(dependenciesNotChecked())
        val chains = findCycleChains(analysis.declarationDependencies)
        val cycles = chains.map { chain -> chain.map { it.from } }
        return cycles(cycles.filterNot(::isInsideOneFile), rules.cyclesBetweenFiles, ConfigKeys.CYCLES_BETWEEN_FILES) +
            cycles(cycles.filter(::isInsideOneFile), rules.cyclesInsideFiles, ConfigKeys.CYCLES_INSIDE_FILES) +
            upwardDependencies(analysis, rules.upward)
    }

    private fun dependenciesNotChecked() = DependenciesNotChecked(
        Severity.WARNING,
        "Cycles and upward dependencies could not be checked: the map has no dependency analysis. The dependencyparser " +
            "is switched off, found no source code it supports, or ran with --omit-graph-analysis."
    )

    private fun isInsideOneFile(declarations: List<Declaration>): Boolean = declarations.map { it.file }.distinct().size == 1

    private fun cycles(cycles: List<List<Declaration>>, rule: DependencyRule?, ruleKey: String): List<Violation> {
        if (rule == null) return emptyList()
        val ignored = PathPatterns(rule.ignore)
        val accepted = Acceptance.ofCycles(rule.accept, acceptSettingOf(ruleKey))
        val reported = cycles
            .filterNot { declarations -> declarations.any { ignored.matches(it.file) } || accepted.accepts(filesOf(declarations)) }
            .map { declarations -> CycleViolation(rule.severity, rule.instruction, declarations) }
            .sortedBy { cycle -> cycle.declarations.joinToString { "${it.file}/${it.name}" } }
        return reported + accepted.staleAmong(cycles.map(::filesOf))
    }

    private fun upwardDependencies(analysis: DependencyAnalysis, rule: DependencyRule?): List<Violation> {
        if (rule == null) return emptyList()
        val ignored = PathPatterns(rule.ignore)
        val accepted = Acceptance.ofUpwardDependencies(rule.accept, acceptSettingOf(ConfigKeys.UPWARD))
        val upward = analysis.declarationDependencies.filter { isUpward(it, analysis.upwardOfFilePair) }
        val reported = upward
            .filterNot { ignored.matches(it.from.file) || ignored.matches(it.to.file) || accepted.accepts(filesOf(it)) }
            .sortedWith(compareBy({ it.from.file }, { it.from.name }, { it.to.file }, { it.to.name }))
            .map { toUpwardDependency(it, rule) }
        return reported + accepted.staleAmong(upward.map(::filesOf))
    }

    private fun filesOf(declarations: List<Declaration>): List<String> = declarations.map { it.file }

    private fun filesOf(dependency: DeclarationDependency): List<String> = listOf(dependency.from.file, dependency.to.file)

    private fun acceptSettingOf(ruleKey: String): String = childPath(childPath(ConfigKeys.DEPENDENCIES, ruleKey), ConfigKeys.ACCEPT)

    private fun toUpwardDependency(dependency: DeclarationDependency, rule: DependencyRule) =
        UpwardViolation(rule.severity, rule.instruction, dependency.from, dependency.to)
}
