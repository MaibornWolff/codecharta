package de.maibornwolff.codecharta.importer.sourcecodeparser

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import com.tngtech.archunit.library.GeneralCodingRules
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices
import org.junit.Ignore
import org.junit.Test


class ArchitectureTest {
    private val classes = ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DONT_INCLUDE_TESTS)
            .importPackages("de.maibornwolff.codecharta.importer.sourcecodeparser")

    @Test
    fun component_core_has_no_outgoing_dependencies() {
        noClasses().that().resideInAPackage("..core..")
                .should().accessClassesThat().resideInAPackage("..oop..").check(classes)
        noClasses().that().resideInAPackage("..core..")
                .should().accessClassesThat().resideInAPackage("..orchestration..").check(classes)
    }

    @Test
    fun any_domain_has_no_outgoing_dependencies() {
        noClasses().that().resideInAPackage("..domain..")
                .should().accessClassesThat().resideInAPackage("..application..")
        noClasses().that().resideInAPackage("..domain..")
                .should().accessClassesThat().resideInAPackage("..infrastructure..").check(classes)
    }

    @Test
    fun `antlr only interacts with itself, standard library and tagging`() {
        noClasses().that().resideInAPackage("..antlr..")
                .should().accessClassesThat().resideOutsideOfPackages("..antlr..", "java.lang..", "..tagging..")
                .check(classes)
    }

    @Test
    fun components_should_be_free_of_cycles() {
        slices().matching("de.maibornwolff.codecharta.importer.sourcecodeparser.(*)..")
                .should().beFreeOfCycles()
    }

    @Test
    fun no_classes_should_throw_generic_exceptions() {
        GeneralCodingRules.NO_CLASSES_SHOULD_THROW_GENERIC_EXCEPTIONS.check(classes)
    }
}