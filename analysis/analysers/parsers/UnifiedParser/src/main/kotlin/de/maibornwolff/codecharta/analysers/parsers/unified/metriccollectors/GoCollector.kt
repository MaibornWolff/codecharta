package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import io.github.treesitter.metrics.api.Language

class GoCollector : MetricCollector() {
    override val language = Language.GO
}
