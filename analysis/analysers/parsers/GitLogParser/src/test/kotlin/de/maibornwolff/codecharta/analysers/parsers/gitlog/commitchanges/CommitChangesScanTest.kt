package de.maibornwolff.codecharta.analysers.parsers.gitlog.commitchanges

import de.maibornwolff.codecharta.model.Cluster
import de.maibornwolff.codecharta.model.NodeId
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.time.LocalDate

class CommitChangesScanTest {
    @TempDir
    lateinit var repository: File

    private val since = LocalDate.parse("2026-01-01")

    @BeforeEach
    fun initialiseRepository() {
        git("init", "-q")
        git("config", "commit.gpgsign", "false")
    }

    private fun git(vararg arguments: String, committedAt: String = "2026-06-01T12:00:00Z"): String {
        val process = ProcessBuilder(listOf("git", "-c", "user.name=Ann", "-c", "user.email=a@x.org") + arguments)
            .directory(repository)
            .redirectErrorStream(true)
        process.environment()["GIT_COMMITTER_DATE"] = committedAt
        process.environment()["GIT_AUTHOR_DATE"] = committedAt
        val running = process.start()
        val output = running.inputStream.bufferedReader().readText()
        check(running.waitFor() == 0) { output }
        return output.trim()
    }

    private fun commitFile(path: String, content: String, message: String = "change", committedAt: String = "2026-06-01T12:00:00Z") {
        File(repository, path).apply {
            parentFile.mkdirs()
            writeText(content)
        }
        commitAll(message, committedAt)
    }

    private fun commitAll(message: String, committedAt: String = "2026-06-01T12:00:00Z") {
        git("add", "-A")
        git("commit", "-q", "-m", message, committedAt = committedAt)
    }

    private fun clusters(from: File = repository, sinceDay: LocalDate = since): List<Cluster> = CommitChangesScan(from, sinceDay)
        .lens()
        .clusterings[CommitChangesLens.CLUSTERING_KEY]
        ?.clusters
        .orEmpty()

    private fun idOf(vararg segments: String) = NodeId.fromSegments(segments.toList())

    @Test
    fun `should write one cluster per commit, the newest first, with its weights and attributes`() {
        // Arrange
        commitFile("src/a.kt", "1\n2\n3\n4\n", message = "Add a")
        commitFile("src/a.kt", "1\n2\n3\nfour\n", message = "Change a")

        // Act
        val clusters = clusters()

        // Assert
        assertThat(clusters.map { it.name.substringAfter(" ") }).containsExactly("Change a", "Add a")
        assertThat(clusters[0].id).isEqualTo(git("rev-parse", "HEAD"))
        assertThat(clusters[0].members.single().nodeId).isEqualTo(idOf("src", "a.kt"))
        assertThat(clusters[0].members.single().weight).isEqualTo(0.5)
        assertThat(clusters[1].members.single().weight).isEqualTo(1.0)
        assertThat(clusters[0].attributes)
            .containsEntry("date", "2026-06-01")
            .containsEntry("changed_files", 1)
            .containsEntry("changed_lines", 2)
    }

    @Test
    fun `should leave out commits before the day, counted in UTC whatever the commit's own offset`() {
        // Arrange
        commitFile("a.kt", "1\n", message = "before, though 2026-01-01 in its own offset", committedAt = "2026-01-01T00:30:00+02:00")
        commitFile("a.kt", "2\n", message = "first moment", committedAt = "2026-01-01T00:00:00Z")

        // Act
        val clusters = clusters()

        // Assert
        assertThat(clusters.map { it.name.substringAfter(" ") }).containsExactly("first moment")
    }

    @Test
    fun `should leave out merge commits and keep the commits of the merged branch`() {
        // Arrange
        commitFile("a.kt", "1\n", message = "base")
        git("checkout", "-q", "-b", "side")
        commitFile("b.kt", "1\n", message = "on side")
        git("checkout", "-q", "-")
        commitFile("c.kt", "1\n", message = "on main")
        git("merge", "-q", "--no-ff", "-m", "merge side", "side")

        // Act
        val names = clusters().map { it.name.substringAfter(" ") }

        // Assert
        assertThat(names).containsExactlyInAnyOrder("base", "on side", "on main")
    }

    @Test
    fun `should follow a rename to the path today, even when the rename came with a change`() {
        // Arrange
        val tenLines = (1..10).joinToString("\n", postfix = "\n")
        commitFile("old.kt", tenLines, message = "add")
        git("mv", "old.kt", "new name.kt")
        File(repository, "new name.kt").writeText(tenLines.replace("10\n", "ten\n"))
        commitAll("rename")

        // Act
        val clusters = clusters()

        // Assert
        assertThat(clusters.map { it.members.single().nodeId }).containsOnly(idOf("new name.kt"))
        assertThat(clusters.first().members.single().weight).isEqualTo(0.2)
    }

    @Test
    fun `should omit the weight of a binary file`() {
        // Arrange
        File(repository, "logo.bin").writeBytes(byteArrayOf(0, 1, 2, 0))
        commitAll("add logo")

        // Act
        val member = clusters().single().members.single()

        // Assert
        assertThat(member.nodeId).isEqualTo(idOf("logo.bin"))
        assertThat(member.weight).isNull()
    }

    @Test
    fun `should use paths relative to a scanned subfolder`() {
        // Arrange
        commitFile("sub/a.kt", "1\n")
        commitFile("other.kt", "1\n")

        // Act
        val clusters = clusters(from = File(repository, "sub"))

        // Assert
        assertThat(clusters.single().members.single().nodeId).isEqualTo(idOf("a.kt"))
    }

    @Test
    fun `should keep the characters of a subject outside ASCII`() {
        // Arrange
        File(repository, "a.kt").writeText("1\n")
        val message = File.createTempFile("message", ".txt", repository.parentFile).apply { writeText("Gr\u00f6\u00dfe \u00e4ndern") }
        git("add", "a.kt")
        git("commit", "-q", "-F", message.path)

        // Act
        val cluster = clusters().single()

        // Assert
        assertThat(cluster.name).endsWith(" Gr\u00f6\u00dfe \u00e4ndern")
    }

    @Test
    fun `should write no clustering for a day after the last commit`() {
        // Arrange
        commitFile("a.kt", "1\n")

        // Act
        val lens = CommitChangesScan(repository, LocalDate.parse("2999-01-01")).lens()

        // Assert
        assertThat(CommitChangesScan.carriesCommitChanges(lens)).isFalse()
    }

    @Test
    fun `should accept only a full date as the day`() {
        // Arrange & Act & Assert
        assertThat(CommitChangesScan.isDate("2026-01-31")).isTrue()
        assertThat(CommitChangesScan.isDate("2026-02-31")).isFalse()
        assertThat(CommitChangesScan.isDate("6 months ago")).isFalse()
    }
}
