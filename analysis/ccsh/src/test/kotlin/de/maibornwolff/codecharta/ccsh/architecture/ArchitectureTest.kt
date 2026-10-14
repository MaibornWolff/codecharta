package de.maibornwolff.codecharta.ccsh.architecture

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices
import org.junit.jupiter.api.Test

class ArchitectureTest {
    companion object {
        private const val BASE_PACKAGE = "de.maibornwolff"
    }

    private val classes = ClassFileImporter()
        .withImportOption(ImportOption.DoNotIncludeTests())
        .importPackages(BASE_PACKAGE)

    @Test
    fun `should have no cyclic dependencies between any two packages of the analysis`() {
        // Arrange & Act & Assert
        slices()
            .matching("$BASE_PACKAGE.(**)")
            .should()
            .beFreeOfCycles()
            .because("every package of the analysis, a parent and its sub-package included, depends one way only")
            .check(classes)
    }
}
