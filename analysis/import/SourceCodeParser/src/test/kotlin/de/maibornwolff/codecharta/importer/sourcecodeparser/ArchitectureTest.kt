package de.maibornwolff.codecharta.importer.sourcecodeparser

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.*
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices
import org.junit.Test


class ArchitectureTest {
    private val classes = ClassFileImporter().withImportOption(ImportOption.Predefined.DONT_INCLUDE_TESTS)
            .importPackages("de.maibornwolff.codecharta.importer.sourcecodeparser")

    @Test
    fun core_has_no_outgoing_dependencies() {
        noClasses().that().resideInAPackage("..core..").should()
                .accessClassesThat().resideInAPackage("..infrastructure..").check(classes)
    }

    @Test
    fun code_should_be_free_of_cycles() {
        slices().matching("de.maibornwolff.codecharta.importer.sourcecodeparser.(*)..")
                .should().beFreeOfCycles()
    }
}