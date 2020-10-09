package de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.VersionControlledFilesInGitProject
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.VersionControlledFilesList
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test

class VersionControlledFilesInGitProjectTest {

    private val metricsFactory = MetricsFactory()
    private lateinit var vcfList: VersionControlledFilesList

    @Before
    fun initialize() {
        vcfList = VersionControlledFilesList(metricsFactory)
    }

    @Test
    fun test_given_vcf_with_files_not_in_project_remove_not_existing_files() {

        vcfList.addFileBy("src/Main.kt")
        vcfList.addFileBy("src/incorrectFile.kt")

        val projectNameList = mutableListOf<String>()
        projectNameList.add("src/Main.kt")

        val versionControlledFilesInGitProject = VersionControlledFilesInGitProject(
            vcfList.getList(),
            projectNameList
        )
        val namesAfterFiltering = versionControlledFilesInGitProject.getListOfVCFilesMatchingGitProject().map { file -> file.filename }

        assertThat(namesAfterFiltering).containsExactlyInAnyOrder("src/Main.kt")
    }

    @Test
    fun test_given_vcf_with_duplicates_then_remove_salt_and_only_keep_most_recent_file() {

        vcfList.addFileBy("src/Main.kt")

        val oldFile = vcfList.get("src/Main.kt")

        vcfList.addFileBy("src/Main.kt")

        val testFilenamesInVCF = vcfList.getList().values.map { file -> file.filename }
        assertThat(testFilenamesInVCF).containsExactlyInAnyOrder("src/Main.kt", "src/Main.kt_\\0_0")

        val vcfFile = vcfList.get("src/Main.kt")
        assertThat(vcfFile?.filename).isEqualTo("src/Main.kt_\\0_0")
        assertThat(oldFile?.filename).isEqualTo("src/Main.kt")

        val projectNameList = mutableListOf<String>()
        projectNameList.add("src/Main.kt")

        val versionControlledFilesInGitProject = VersionControlledFilesInGitProject(
            vcfList.getList(),
            projectNameList
        )
        val namesAfterFiltering = versionControlledFilesInGitProject.getListOfVCFilesMatchingGitProject()

        assertThat(namesAfterFiltering).containsExactlyInAnyOrder(vcfFile)
        assertThat(namesAfterFiltering).doesNotContain(oldFile)
    }

    @Test
    fun test_given_vcf_with_duplicates_with_second_file_added_deleted_then_delete__second_file() {

        vcfList.addFileBy("src/Main.kt")

        val keepFile = vcfList.get("src/Main.kt")

        vcfList.addFileBy("src/Main.kt")

        val deleteFile = vcfList.get("src/Main.kt")
        deleteFile?.markDeleted()

        assertThat(deleteFile?.filename).isEqualTo("src/Main.kt_\\0_0")
        assertThat(keepFile?.filename).isEqualTo("src/Main.kt")

        val projectNameList = mutableListOf<String>()
        projectNameList.add("src/Main.kt")

        val versionControlledFilesInGitProject = VersionControlledFilesInGitProject(
            vcfList.getList(),
            projectNameList
        )
        val namesAfterFiltering = versionControlledFilesInGitProject.getListOfVCFilesMatchingGitProject()

        assertThat(namesAfterFiltering).containsExactlyInAnyOrder(keepFile)
        assertThat(namesAfterFiltering).doesNotContain(deleteFile)
    }
}
