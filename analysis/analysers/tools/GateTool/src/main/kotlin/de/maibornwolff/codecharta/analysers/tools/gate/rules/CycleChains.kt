package de.maibornwolff.codecharta.analysers.tools.gate.rules

// Mirrors findCycleChains in visualization/.../dependencyMap/declarations/cycleChains.ts and upwardRuleOf in
// .../renderer/dependencyGraph/util/edgeProjection.ts, so the gate counts the cycles and upward dependencies the
// dependency view shows. Change both sides together.

typealias CycleChain = List<DeclarationDependency>

fun findCycleChains(dependencies: List<DeclarationDependency>): List<CycleChain> {
    val cyclicSteps = dependencies.filter { it.isCyclic }.groupBy { it.from }
    val chains = LinkedHashMap<List<Declaration>, CycleChain>()
    cyclicSteps.forEach { (start, firstSteps) ->
        firstSteps.forEach { firstStep ->
            shortestWay(firstStep.to, start, cyclicSteps)?.let { wayBack ->
                val chain = listOf(firstStep) + wayBack
                chains.putIfAbsent(identityOf(chain), chain)
            }
        }
    }
    return chains.values.toList()
}

fun isUpward(dependency: DeclarationDependency, upwardOfFilePair: Map<Pair<String, String>, Boolean>): Boolean {
    val saidByTheFiles = if (dependency.isInsideOneFile) null else upwardOfFilePair[dependency.from.file to dependency.to.file]
    return saidByTheFiles ?: dependency.isPointingUpwards
}

private fun shortestWay(
    from: Declaration,
    to: Declaration,
    cyclicSteps: Map<Declaration, List<DeclarationDependency>>
): List<DeclarationDependency>? {
    val stepInto = LinkedHashMap<Declaration, DeclarationDependency?>().apply { put(from, null) }
    val queue = ArrayDeque(listOf(from))
    while (queue.isNotEmpty() && to !in stepInto) {
        cyclicSteps[queue.removeFirst()].orEmpty().forEach { step ->
            if (step.to !in stepInto) {
                stepInto[step.to] = step
                queue.addLast(step.to)
            }
        }
    }
    return if (from == to) emptyList() else walkedBack(stepInto, to)
}

private fun walkedBack(stepInto: Map<Declaration, DeclarationDependency?>, to: Declaration): List<DeclarationDependency>? {
    if (to !in stepInto) return null
    val way = ArrayDeque<DeclarationDependency>()
    var step = stepInto[to]
    while (step != null) {
        way.addFirst(step)
        step = stepInto[step.from]
    }
    return way.toList()
}

private fun identityOf(chain: CycleChain): List<Declaration> {
    val reached = chain.map { it.to }
    val first = reached.indices.minBy { "${reached[it].file}/${reached[it].name}" }
    return reached.drop(first) + reached.take(first)
}
