package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency

data class DependencyWrapper(val dependency: Dependency, val isConstant: Boolean = false)
