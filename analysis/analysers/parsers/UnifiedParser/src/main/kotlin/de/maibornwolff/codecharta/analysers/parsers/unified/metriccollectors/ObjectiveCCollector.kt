package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import io.github.treesitter.metrics.api.Language

class ObjectiveCCollector : MetricCollector() {
    override val language = Language.OBJECTIVE_C
}
