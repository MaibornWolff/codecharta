package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import org.junit.Test
import org.junit.Assert.*

class VersionControlledFilesListTest {

    private val metricsFactory = MetricsFactory()

    @Test
    fun test_get_vcf_by_key() {
        val vcfList = VersionControlledFilesList();
        val fileKey = "src/Main.kt"
        val vcfFile = VersionControlledFile(fileKey, metricsFactory)

        vcfList.add(fileKey, vcfFile)

        assertSame(vcfFile, vcfList.get(fileKey))
    }
}