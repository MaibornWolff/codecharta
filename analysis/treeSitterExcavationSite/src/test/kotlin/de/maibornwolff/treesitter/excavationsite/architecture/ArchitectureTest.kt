package de.maibornwolff.treesitter.excavationsite.architecture

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("Architecture Rules")
class ArchitectureTest {
    companion object {
        private const val BASE_PACKAGE = "de.maibornwolff.treesitter.excavationsite"
    }

    private val classes = ClassFileImporter()
        .withImportOption(ImportOption.DoNotIncludeTests())
        .importPackages(BASE_PACKAGE)

    // region Layer Dependency Rules

    @Nested
    @DisplayName("Layer Dependency Rules")
    inner class LayerDependencyRules {
        @Test
        fun `should allow api to depend on languages, metrics, and extraction model`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.api..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                    "$BASE_PACKAGE.integration.metrics.calculators..",
                    "$BASE_PACKAGE.integration.metrics.ports..",
                    "$BASE_PACKAGE.integration.metrics.adapters..",
                    "$BASE_PACKAGE.integration.extraction.extractors..",
                    "$BASE_PACKAGE.integration.extraction.parsers..",
                    "$BASE_PACKAGE.shared.infrastructure.walker.."
                ).because("API should only depend on public interfaces, not internal implementations")
                .check(classes)
        }

        @Test
        fun `should prevent metrics from depending on extraction`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.integration.metrics..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("$BASE_PACKAGE.integration.extraction..")
                .because("Metrics feature should be independent from extraction feature")
                .check(classes)
        }

        @Test
        fun `should prevent extraction from depending on metrics`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.integration.extraction..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("$BASE_PACKAGE.integration.metrics..")
                .because("Extraction feature should be independent from metrics feature")
                .check(classes)
        }

        @Test
        fun `should prevent dependencies from depending on metrics`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.integration.dependencies..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("$BASE_PACKAGE.integration.metrics..")
                .because("Dependencies feature should be independent from metrics feature")
                .check(classes)
        }

        @Test
        fun `should prevent dependencies from depending on extraction`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.integration.dependencies..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("$BASE_PACKAGE.integration.extraction..")
                .because("Dependencies feature should be independent from extraction feature")
                .check(classes)
        }

        @Test
        fun `should prevent metrics from depending on dependencies`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.integration.metrics..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("$BASE_PACKAGE.integration.dependencies..")
                .because("Metrics feature should be independent from dependencies feature")
                .check(classes)
        }

        @Test
        fun `should prevent extraction from depending on dependencies`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.integration.extraction..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("$BASE_PACKAGE.integration.dependencies..")
                .because("Extraction feature should be independent from dependencies feature")
                .check(classes)
        }

        @Test
        fun `should prevent shared walker from depending on features`() {
            // Arrange & Act & Assert
            // Shared walker infrastructure should not depend on features
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.shared.infrastructure.walker..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                    "$BASE_PACKAGE.api..",
                    "$BASE_PACKAGE.integration..",
                    "$BASE_PACKAGE.languages.."
                ).because("Shared walker infrastructure should have no internal dependencies")
                .check(classes)
        }

        @Test
        fun `should ensure shared domain is the innermost layer with no internal dependencies`() {
            // Arrange & Act & Assert
            // Shared domain is the core of hexagonal architecture - no dependencies on other layers
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.shared.domain..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                    "$BASE_PACKAGE.api..",
                    "$BASE_PACKAGE.integration..",
                    "$BASE_PACKAGE.languages..",
                    "$BASE_PACKAGE.shared.infrastructure.."
                ).because("Shared domain is the innermost layer and should have no internal dependencies")
                .check(classes)
        }

        @Test
        fun `should prevent languages from depending on metrics implementations`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.languages..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                    "$BASE_PACKAGE.integration.metrics.calculators..",
                    "$BASE_PACKAGE.integration.metrics.ports..",
                    "$BASE_PACKAGE.integration.metrics.adapters.."
                ).because("Languages should only depend on Metric and CalculationExtensions, not implementations")
                .check(classes)
        }

        @Test
        fun `should prevent languages from depending on extraction parsers`() {
            // Arrange & Act & Assert
            // Languages can depend on extractors (they define extraction behavior)
            // but should not depend on parsers (internal implementation detail)
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.languages..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                    "$BASE_PACKAGE.integration.extraction.parsers.."
                ).because("Languages should not depend on parser implementations")
                .check(classes)
        }

        @Test
        fun `should prevent languages from depending on api`() {
            // Arrange & Act & Assert
            noClasses()
                .that()
                .resideInAPackage("$BASE_PACKAGE.languages..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("$BASE_PACKAGE.api..")
                .because("Languages is a lower layer than API")
                .check(classes)
        }
    }

    // endregion

    // region Cyclic Dependency Rules

    @Nested
    @DisplayName("Cyclic Dependency Rules")
    inner class CyclicDependencyRules {
        @Test
        fun `should have no cyclic dependencies within features`() {
            // Arrange & Act & Assert
            // Check for cycles within the features package (metrics and extraction should be independent)
            slices()
                .matching("$BASE_PACKAGE.integration.(*)..")
                .should()
                .beFreeOfCycles()
                .because("Integration packages should not have cyclic dependencies")
                .check(classes)
        }

        @Test
        fun `should have no cyclic dependencies between languages and metrics`() {
            // Arrange & Act & Assert
            // This specifically guards against the cycle we fixed:
            // languages/ depending on features/metrics/calculators/
            slices()
                .matching("$BASE_PACKAGE.integration.metrics.(*)..")
                .should()
                .beFreeOfCycles()
                .because("Metrics sub-packages should not have cyclic dependencies")
                .check(classes)
        }
    }

    // endregion
}
