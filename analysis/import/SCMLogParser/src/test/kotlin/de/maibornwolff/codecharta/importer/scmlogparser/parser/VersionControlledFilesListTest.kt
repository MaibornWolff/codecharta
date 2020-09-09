package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import org.hamcrest.CoreMatchers.equalTo
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

class VersionControlledFilesListTest {

    private val metricsFactory = MetricsFactory()
    private lateinit var vcfList: VersionControlledFilesList

    @Before
    fun initialize() {
        vcfList = VersionControlledFilesList(metricsFactory)
    }

    @Test
    fun test_get_vcf_by_key() {
        val fileKey = "src/Main.kt"
        val vcf = vcfList.addFileBy(fileKey)
        assertThat(vcf, equalTo(vcfList.get(fileKey)))

        val tmpFileName = "src/Main_tmp.kt"
        vcfList.rename(fileKey, tmpFileName)
        val tmp1 = vcfList.get(fileKey)
        assertThat(vcf, equalTo(vcfList.get(fileKey)))

        val newFileName = "src/Main_new.kt"
        vcfList.rename(tmpFileName, newFileName)
        val tmp2 = vcfList.get(tmpFileName) // retrieve by newFileName?
        assertThat(vcf, equalTo(vcfList.get(tmpFileName)))
    }

    @Test
    fun test_given_vcf_list_when_get_by_file_list_return_corresponding_files() {
        val mainKey = "src/Main.kt"
        val mainFile = vcfList.addFileBy(mainKey)

        val testKey = "src/Test.kt"
        val testFile = vcfList.addFileBy(testKey)

        val fileKey = "src/File.kt"
        val vcfFile = vcfList.addFileBy(fileKey)

        val filesForNames = vcfList.getBy(mutableListOf(mainKey, fileKey))

        assertThat(filesForNames[0], equalTo(mainFile))
        assertThat(filesForNames[1], equalTo(vcfFile))
    }

    @Test
    fun test_given_vcf_list_when_retrieve_renamed_files_then_return_corresponding_files() {
        val mainKey = "src/Main.kt"
        val mainFile = vcfList.addFileBy(mainKey)

        val testKey = "src/Test.kt"
        val testFile = vcfList.addFileBy(testKey)

        val fileKey = "src/File.kt"
        val tmpFileKey = "src/File1.kt"
        val newFileKey = "src/File1.1.kt"
        val vcfFile = vcfList.addFileBy(fileKey)

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
        val mainKey = "src/Main.kt"
        val mainFile = vcfList.addFileBy(mainKey)

        val originalFileKey = "src/File.kt"
        val originalFile = vcfList.addFileBy(originalFileKey)

        assertThat(mainFile, equalTo(vcfList.get(mainKey)))
        assertThat(originalFile, equalTo(vcfList.get(originalFileKey)))

        val newFileName = "src/File_new.kt"
        vcfList.rename(originalFileKey, newFileName)
        assertThat(originalFile, equalTo(vcfList.get(originalFileKey)))

        val renamedFileKey = "src/File.kt"
        val renamedFile = vcfList.addFileBy(renamedFileKey)

        assertThat(renamedFile, equalTo(vcfList.get(renamedFileKey)))
    }
}