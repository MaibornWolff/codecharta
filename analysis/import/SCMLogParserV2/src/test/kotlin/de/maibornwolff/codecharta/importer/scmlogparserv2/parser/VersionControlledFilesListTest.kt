package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import org.hamcrest.CoreMatchers.equalTo
import org.junit.Assert.assertThat
import org.junit.Before
import org.junit.Test

class VersionControlledFilesListTest {

    private val metricsFactory = MetricsFactory()
    private lateinit var vcfList: VersionControlledFilesList

    @Before
    fun initialize() {
        vcfList = VersionControlledFilesList(metricsFactory)
    }

    @Test
    fun test_given_added_file_when_renamed_multiple_times_then_get_by_latest_key() {
        val oldestName = "src/Main.kt"
        val vcf = vcfList.addFileBy(oldestName)
        assertThat(vcf, equalTo(vcfList.get(oldestName)))

        val tmpFileName = "src/Main_tmp.kt"
        vcfList.rename(oldestName, tmpFileName)
        assertThat(vcf, equalTo(vcfList.get(tmpFileName)))
        assertThat(vcf.filename, equalTo(tmpFileName))

        val newFileName = "src/Main_new.kt"
        vcfList.rename(tmpFileName, newFileName)
        assertThat(vcf, equalTo(vcfList.get(newFileName)))
        assertThat(vcf.filename, equalTo(newFileName))
    }

    @Test
    fun test_given_added_file_when_renamed_multiple_times_then_get_by_oldest_key_every_time() {
        val oldestName = "src/Main.kt"
        val vcf = vcfList.addFileBy(oldestName)
        assertThat(vcf, equalTo(vcfList.get(oldestName)))

        val tmpFileName = "src/Main_tmp.kt"
        vcfList.rename(oldestName, tmpFileName)
        assertThat(vcf, equalTo(vcfList.get(oldestName)))

        val newFileName = "src/Main_new.kt"
        vcfList.rename(tmpFileName, newFileName)
        assertThat(vcf, equalTo(vcfList.get(oldestName)))
    }

    @Test
    fun test_given_renamed_file_when_add_file_with_original_name_then_add_with_salted_name() {
        val originalFileKey = "src/File.kt"
        val originalFile = vcfList.addFileBy(originalFileKey)

        assertThat(originalFile, equalTo(vcfList.get(originalFileKey)))
        assertThat(originalFile.filename, equalTo(originalFileKey))

        val newFileName = "src/File_new.kt"
        vcfList.rename(originalFileKey, newFileName)

        assertThat(originalFile.filename, equalTo(newFileName))
        assertThat(originalFile.containsRename(newFileName), equalTo(true))
        assertThat(originalFile, equalTo(vcfList.get(newFileName)))

        val alreadyExistedFileName = "src/File.kt"
        val conflictingFile = vcfList.addFileBy(alreadyExistedFileName)

        assertThat(conflictingFile, equalTo(vcfList.get(alreadyExistedFileName)))
        assertThat(conflictingFile.filename.contains("0_0"), equalTo(true))

        assertThat(vcfList.getList().size, equalTo(2))
    }

    @Test
    fun test_given_deleted_file_when_add_file_with_original_name_then_replace_original_file() {
        val originalFileKey = "src/File.kt"
        val originalFile = vcfList.addFileBy(originalFileKey)
        originalFile.markDeleted()

        assertThat(originalFile, equalTo(vcfList.get(originalFileKey)))
        assertThat(originalFile.filename, equalTo(originalFileKey))
        assertThat(originalFile.isDeleted(), equalTo(true))

        val conflictingFileName = "src/File.kt"
        val nameConflictingFile = vcfList.addFileBy(conflictingFileName)

        assertThat(nameConflictingFile.filename, equalTo(conflictingFileName))
        assertThat(nameConflictingFile, equalTo(vcfList.get(conflictingFileName)))
        assertThat(nameConflictingFile.isDeleted(), equalTo(false))

        assertThat(vcfList.getList().size, equalTo(1))
    }

    @Test
    fun test_given_deleted_file_when_rename_other_file_to_original_name_then_replace_original_file() {
        val originalFileKey = "src/File.kt"
        val originalFile = vcfList.addFileBy(originalFileKey)
        originalFile.markDeleted()

        assertThat(originalFile, equalTo(vcfList.get(originalFileKey)))
        assertThat(originalFile.filename, equalTo(originalFileKey))
        assertThat(originalFile.isDeleted(), equalTo(true))

        val otherFileName = "src/OtherFile.kt"
        val otherFile = vcfList.addFileBy(otherFileName)

        vcfList.rename(otherFileName, originalFileKey)

        assertThat(otherFile, equalTo(vcfList.get(originalFileKey)))
        assertThat(otherFile.isDeleted(), equalTo(false))
        assertThat(otherFile.containsRename(otherFileName), equalTo(true))
        assertThat(otherFile.containsRename(originalFileKey), equalTo(true))

        assertThat(vcfList.getList().size, equalTo(1))
    }
}
