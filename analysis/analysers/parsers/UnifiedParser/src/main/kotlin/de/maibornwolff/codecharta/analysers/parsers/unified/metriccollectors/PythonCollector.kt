package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.PythonQueries
import org.treesitter.TreeSitterPython

class PythonCollector : MetricCollector(
    treeSitterLanguage = TreeSitterPython(),
    queryProvider = PythonQueries()
)
