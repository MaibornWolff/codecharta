package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import org.hamcrest.CoreMatchers.equalTo
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

        assertThat(vcfFile, equalTo(vcfList.get(fileKey)))

        val tmpFileName = "src/Main_tmp.kt"

        vcfList.rename(fileKey, tmpFileName)

        assertThat(vcfFile, equalTo(vcfList.get(fileKey)))

        val newFileName = "src/Main_new.kt"

        vcfList.rename(tmpFileName, newFileName)

        assertThat(vcfFile, equalTo(vcfList.get(tmpFileName)))
    }

    @Test
    fun test_given_vcf_list_when_get_by_file_list_return_corresponding_files() {
        val vcfList = VersionControlledFilesList();

        val mainKey = "src/Main.kt"
        val mainFile = VersionControlledFile(mainKey, metricsFactory)

        val testKey = "src/Test.kt"
        val testFile = VersionControlledFile(testKey, metricsFactory)

        val fileKey = "src/File.kt"
        val vcfFile = VersionControlledFile(fileKey, metricsFactory)

        vcfList.add(fileKey, vcfFile)
        vcfList.add(testKey, testFile)
        vcfList.add(mainKey, mainFile)

        val filesForNames = vcfList.getBy(mutableListOf(mainKey, fileKey))

        assertThat(filesForNames[0], equalTo(mainFile))
        assertThat(filesForNames[1], equalTo(vcfFile))
    }

    @Test
    fun test_given_vcf_list_when_retrieve_renamed_files_then_return_corresponding_files() {
        val vcfList = VersionControlledFilesList();

        val mainKey = "src/Main.kt"
        val mainFile = VersionControlledFile(mainKey, metricsFactory)

        val testKey = "src/Test.kt"
        val testFile = VersionControlledFile(testKey, metricsFactory)

        val fileKey = "src/File.kt"
        val tmpFileKey = "src/File1.kt"
        val newFileKey = "src/File1.1.kt"
        val vcfFile = VersionControlledFile(fileKey, metricsFactory)

        vcfList.add(fileKey, vcfFile)
        vcfList.add(testKey, testFile)
        vcfList.add(mainKey, mainFile)

        vcfList.rename(fileKey, tmpFileKey)

        val tmpRenamedFile = vcfList.getBy(mutableListOf(tmpFileKey))
        assertThat(tmpRenamedFile[0], equalTo(vcfFile))

        vcfList.rename(tmpFileKey, newFileKey)

        val filesForNames = vcfList.getBy(mutableListOf(mainKey, tmpFileKey))

        assertThat(filesForNames[0], equalTo(mainFile))
        assertThat(filesForNames[1], equalTo(vcfFile))
    }

    @Test
    fun test_given_vcf_list_when_retrieve_renamed_files_featuring_rename_conflict_then_return_corresponding_files() {
        val vcfList = VersionControlledFilesList();

        val mainKey = "src/Main.kt"
        val mainFile = VersionControlledFile(mainKey, metricsFactory)

        val originalFileKey = "src/File.kt"
        val originalFile = VersionControlledFile(originalFileKey, metricsFactory)

        vcfList.add(mainKey, mainFile)
        vcfList.add(originalFileKey, originalFile)
        assertThat(mainFile, equalTo(vcfList.get(mainKey)))
        assertThat(originalFile, equalTo(vcfList.get(originalFileKey)))

        val newFileName = "src/File_new.kt"
        vcfList.rename(originalFileKey, newFileName)
        assertThat(originalFile, equalTo(vcfList.get(originalFileKey)))

        val renamedFileKey = "src/File.kt"
        val renamedFile = VersionControlledFile(renamedFileKey, metricsFactory)
        vcfList.add(renamedFileKey, renamedFile)

        assertThat(renamedFile, equalTo(vcfList.get(renamedFileKey)))
    }
}