package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import de.maibornwolff.treesitter.excavationsite.shared.domain.MetricCondition

/** Node types that count for a metric: always, or when one of the conditions given for the type holds. */
class TreeNodeTypes(val simpleNodeTypes: Set<String>, val conditionalNodeTypes: Map<String, List<MetricCondition>> = emptyMap())
