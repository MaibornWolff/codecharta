package de.maibornwolff.codecharta.analysers.importers.coverage

import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.CloverStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.CoberturaStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.ImporterStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.JUnitStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.JacocoStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.LcovStrategy
import de.maibornwolff.codecharta.analysers.importers.coverage.strategies.PHPUnitStrategy
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.isFileWithOneOrMoreOfEndingsPresent

internal enum class Format(
    val formatName: String,
    val strategy: ImporterStrategy,
    val fileExtension: FileExtension,
    val defaultReportFileName: String,
    val coverageAttributes: List<CoverageAttributes>
) {
    LCOV(
        "lcov",
        LcovStrategy(),
        FileExtension.INFO,
        "lcov.info",
        listOf(
            CoverageAttributes.LINE_COVERAGE,
            CoverageAttributes.BRANCH_COVERAGE,
            CoverageAttributes.STATEMENT_COVERAGE
        )
    ),
    JACOCO(
        "JaCoCo",
        JacocoStrategy(),
        FileExtension.XML,
        "jacoco.xml",
        listOf(
            CoverageAttributes.LINE_COVERAGE,
            CoverageAttributes.INSTRUCTION_COVERAGE,
            CoverageAttributes.COMPLEXITY_COVERAGE,
            CoverageAttributes.METHOD_COVERAGE,
            CoverageAttributes.CLASS_COVERAGE
        )
    ),
    CLOVER(
        "Clover",
        CloverStrategy(),
        FileExtension.XML,
        "clover.xml",
        listOf(
            CoverageAttributes.LINE_COVERAGE,
            CoverageAttributes.BRANCH_COVERAGE,
            CoverageAttributes.METHOD_COVERAGE
        )
    ),
    COBERTURA(
        "Cobertura",
        CoberturaStrategy(),
        FileExtension.XML,
        "coverage.cobertura.xml",
        listOf(
            CoverageAttributes.LINE_COVERAGE,
            CoverageAttributes.BRANCH_COVERAGE
        )
    ),
    PHPUNIT(
        "PHPUnit",
        PHPUnitStrategy(),
        FileExtension.XML,
        "index.xml",
        listOf(CoverageAttributes.LINE_COVERAGE)
    ),
    JUNIT(
        "JUnit",
        JUnitStrategy(),
        FileExtension.XML,
        "junit.xml",
        listOf()
    )
}

internal fun getFormatNames(): List<String> {
    return Format.entries.map { format -> format.formatName }
}

internal fun getFormatByName(formatName: String): Format {
    val element = Format.entries.firstOrNull {
        val currentNameLower = it.formatName.lowercase()
        val nameToCheckLower = formatName.lowercase()
        currentNameLower == nameToCheckLower || currentNameLower + it.fileExtension.extension == nameToCheckLower
    }
    require(element != null) { "Unsupported format found: $formatName" }
    return element
}

internal fun isAnyStrategyApplicable(resourceToBeParsed: String): Boolean {
    return Format.entries.any {
        isFileWithOneOrMoreOfEndingsPresent(resourceToBeParsed, listOf(it.fileExtension))
    }
}
