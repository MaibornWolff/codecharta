package de.maibornwolff.codecharta.importer.sourcecodeparser

import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import com.tngtech.archunit.library.GeneralCodingRules
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices
import org.junit.Test


class ArchitectureTest {
    private val classes = ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DONT_INCLUDE_TESTS)
            .importPackages("de.maibornwolff.codecharta.importer.sourcecodeparser")

    @Test
    fun `component core has no outgoing dependencies`() {
        noClasses().that().resideInAPackage("..core..")
                .should().accessClassesThat().resideInAPackage("..oop..").check(classes)
        noClasses().that().resideInAPackage("..core..")
                .should().accessClassesThat().resideInAPackage("..orchestration..").check(classes)
    }

    @Test
    fun `any domain layer has no outgoing dependencies`() {
        noClasses().that().resideInAPackage("..domain..")
                .should().accessClassesThat().resideInAPackage("..application..").check(classes)
        noClasses().that().resideInAPackage("..domain..")
                .should().accessClassesThat().resideInAPackage("..infrastructure..").check(classes)
    }

    @Test
    fun `any application layer has no outwards going dependencies`() {
        noClasses().that().resideInAPackage("..application..")
                .should().accessClassesThat().resideInAPackage("..infrastructure..").check(classes)
    }

    @Test
    fun `components should be free of cycles`() {
        slices().matching("de.maibornwolff.codecharta.importer.sourcecodeparser.(*)..")
                .should().beFreeOfCycles().check(classes)
    }

    @Test
    fun `no classes should throw generic exceptions`() {
        GeneralCodingRules.NO_CLASSES_SHOULD_THROW_GENERIC_EXCEPTIONS.check(classes)
    }
}