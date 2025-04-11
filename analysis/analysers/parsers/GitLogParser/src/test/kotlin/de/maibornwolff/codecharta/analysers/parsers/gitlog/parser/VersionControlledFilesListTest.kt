package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.MetricsFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class VersionControlledFilesListTest {
    private val metricsFactory = MetricsFactory()
    private lateinit var vcfList: VersionControlledFilesList

    @BeforeEach
    fun initialize() {
        vcfList = VersionControlledFilesList(metricsFactory)
    }

    @Test
    fun test_given_added_file_when_renamed_multiple_times_then_get_by_latest_key() {
        val oldestName = "src/Main.kt"
        val vcf = vcfList.addFileBy(oldestName)
        assertEquals(vcfList.get(oldestName), vcf)

        val tmpFileName = "src/Main_tmp.kt"
        vcfList.rename(oldestName, tmpFileName)
        assertEquals(vcfList.get(tmpFileName), vcf)
        assertEquals(tmpFileName, vcf.filename)

        val newFileName = "src/Main_new.kt"
        vcfList.rename(tmpFileName, newFileName)
        assertEquals(vcfList.get(newFileName), vcf)
        assertEquals(newFileName, vcf.filename)
    }

    @Test
    fun test_given_added_file_when_renamed_multiple_times_then_get_by_oldest_key_every_time() {
        val oldestName = "src/Main.kt"
        val vcf = vcfList.addFileBy(oldestName)
        assertEquals(vcfList.get(oldestName), vcf)

        val tmpFileName = "src/Main_tmp.kt"
        vcfList.rename(oldestName, tmpFileName)
        assertEquals(vcfList.get(oldestName), vcf)

        val newFileName = "src/Main_new.kt"
        vcfList.rename(tmpFileName, newFileName)
        assertEquals(vcfList.get(oldestName), vcf)
    }

    @Test
    fun test_given_renamed_file_when_add_file_with_original_name_then_add_with_salted_name() {
        val originalFileKey = "src/File.kt"
        val originalFile = vcfList.addFileBy(originalFileKey)

        assertEquals(vcfList.get(originalFileKey), originalFile)
        assertEquals(originalFile.filename, originalFileKey)

        val newFileName = "src/File_new.kt"
        vcfList.rename(originalFileKey, newFileName)

        assertEquals(originalFile.filename, newFileName)
        assertTrue(originalFile.containsRename(newFileName))
        assertEquals(vcfList.get(newFileName), originalFile)

        val alreadyExistedFileName = "src/File.kt"
        val conflictingFile = vcfList.addFileBy(alreadyExistedFileName)

        assertEquals(vcfList.get(alreadyExistedFileName), conflictingFile)
        assertTrue(conflictingFile.filename.contains("0_0"))

        assertEquals(2, vcfList.getList().size)
    }

    @Test
    fun test_given_deleted_file_when_add_file_with_original_name_then_replace_original_file() {
        val originalFileKey = "src/File.kt"
        val originalFile = vcfList.addFileBy(originalFileKey)
        originalFile.markDeleted()

        assertEquals(vcfList.get(originalFileKey), originalFile)
        assertEquals(originalFileKey, originalFile.filename)
        assertTrue(originalFile.isDeleted())

        val conflictingFileName = "src/File.kt"
        val nameConflictingFile = vcfList.addFileBy(conflictingFileName)

        assertEquals(conflictingFileName, nameConflictingFile.filename)
        assertEquals(vcfList.get(conflictingFileName), nameConflictingFile)
        assertFalse(nameConflictingFile.isDeleted())

        assertEquals(vcfList.getList().size, 1)
    }

    @Test
    fun test_given_deleted_file_when_rename_other_file_to_original_name_then_replace_original_file() {
        val originalFileKey = "src/File.kt"
        val originalFile = vcfList.addFileBy(originalFileKey)
        originalFile.markDeleted()

        assertEquals(vcfList.get(originalFileKey), originalFile)
        assertEquals(originalFileKey, originalFile.filename)
        assertTrue(originalFile.isDeleted())

        val otherFileName = "src/OtherFile.kt"
        val otherFile = vcfList.addFileBy(otherFileName)

        vcfList.rename(otherFileName, originalFileKey)

        assertEquals(vcfList.get(originalFileKey), otherFile)
        assertFalse(otherFile.isDeleted())
        assertTrue(otherFile.containsRename(otherFileName))
        assertTrue(otherFile.containsRename(originalFileKey))

        assertEquals(1, vcfList.getList().size)
    }
}
