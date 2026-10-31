package de.maibornwolff.codecharta.analysers.parsers.gitlog.ownership

import de.maibornwolff.codecharta.model.ClusterMember
import de.maibornwolff.codecharta.model.NodeId
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class AuthorOwnershipScanTest {
    @TempDir
    lateinit var repository: File

    @BeforeEach
    fun initialiseRepository() {
        git("init", "-q")
        git("config", "commit.gpgsign", "false")
    }

    private fun git(vararg arguments: String, author: String = "Ann <ann@x.org>"): String {
        val process = ProcessBuilder(listOf("git", "-c", "user.name=Committer", "-c", "user.email=c@x.org") + arguments)
            .directory(repository)
            .redirectErrorStream(true)
        process.environment()["GIT_AUTHOR_NAME"] = author.substringBefore(" <")
        process.environment()["GIT_AUTHOR_EMAIL"] = author.substringAfter("<").removeSuffix(">")
        val running = process.start()
        val output = running.inputStream.bufferedReader().readText()
        check(running.waitFor() == 0) { output }
        return output.trim()
    }

    private fun commitFile(path: String, content: String, author: String = "Ann <ann@x.org>") {
        File(repository, path).apply {
            parentFile.mkdirs()
            writeText(content)
        }
        git("add", "-A")
        git("commit", "-q", "-m", "change", author = author)
    }

    private fun clusters() = AuthorOwnershipScan(repository).lens().clusterings.getValue("author-ownership").clusters

    private fun membersOf(clusterName: String) = clusters().single { it.name == clusterName }.members

    private fun idOf(vararg segments: String) = NodeId.fromSegments(segments.toList())

    @Test
    fun `should attribute each file to who last changed its lines`() {
        // Arrange
        commitFile("src/a.kt", "1\n2\n3\n4\n")
        commitFile("src/a.kt", "1\n2\n3\nfour\n", author = "Bob <bob@x.org>")

        // Act
        val annMembers = membersOf("Author 1")
        val bobMembers = membersOf("Author 2")

        // Assert
        assertThat(annMembers).containsExactly(ClusterMember(idOf("src", "a.kt"), 0.75))
        assertThat(bobMembers).containsExactly(ClusterMember(idOf("src", "a.kt"), 0.25))
    }

    @Test
    fun `should mark the clusters with the first commit of the repository`() {
        // Arrange
        commitFile("a.kt", "1\n")
        val firstCommit = git("rev-parse", "HEAD")
        commitFile("b.kt", "1\n", author = "Bob <bob@x.org>")

        // Act
        val ids = clusters().map { it.id }

        // Assert
        assertThat(ids).containsExactly("${firstCommit.take(7)}-author-1", "${firstCommit.take(7)}-author-2")
    }

    @Test
    fun `should keep the number of an author none of whose lines survived`() {
        // Arrange
        commitFile("a.kt", "ann\n")
        commitFile("a.kt", "bob\n", author = "Bob <bob@x.org>")

        // Act
        val names = clusters().map { it.name }

        // Assert
        assertThat(names).containsExactly("Author 2")
    }

    @Test
    fun `should treat two identities a mailmap joins as one author`() {
        // Arrange
        commitFile(".mailmap", "Ann <ann@x.org> Old Ann <old@x.org>\n")
        commitFile("a.kt", "old\n", author = "Old Ann <old@x.org>")

        // Act
        val names = clusters().map { it.name }

        // Assert
        assertThat(names).containsExactly("Author 1")
    }

    @Test
    fun `should give ignored revisions no lines`() {
        // Arrange
        commitFile("a.kt", "fun a() {}\nfun b() {}\n")
        commitFile("b.kt", "x\n")
        commitFile("a.kt", "fun a() { }\nfun b() { }\n", author = "Formatter <f@x.org>")
        val formatCommit = git("rev-parse", "HEAD")
        commitFile(".git-blame-ignore-revs", "$formatCommit\n")

        // Act
        val names = clusters().map { it.name }

        // Assert
        assertThat(names).containsExactly("Author 1")
    }

    @Test
    fun `should give a binary file no member`() {
        // Arrange
        commitFile("a.kt", "1\n")
        File(repository, "logo.png").writeBytes(byteArrayOf(0, 1, 2, 0, 10, 0, 3))
        git("add", "-A")
        git("commit", "-q", "-m", "binary")

        // Act
        val members = clusters().single().members

        // Assert
        assertThat(members).containsExactly(ClusterMember(idOf("a.kt"), 1.0))
    }

    @Test
    fun `should leave uncommitted lines unattributed and skip a file deleted from the working tree`() {
        // Arrange
        commitFile("a.kt", "1\n")
        commitFile("gone.kt", "1\n")
        File(repository, "a.kt").writeText("1\nnew\n")
        File(repository, "gone.kt").delete()

        // Act
        val members = clusters().single().members

        // Assert
        assertThat(members).containsExactly(ClusterMember(idOf("a.kt"), 0.5))
    }

    @Test
    fun `should read paths and names beyond ascii`() {
        // Arrange
        // The JVM encodes file names and process arguments by the locale, so this cannot even be set up under a C locale.
        assumeTrue(System.getProperty("sun.jnu.encoding").equals("UTF-8", ignoreCase = true))
        commitFile("ümlaut dir/fïle.kt", "1\n", author = "Zoë <z@x.org>")

        // Act
        val members = clusters().single().members

        // Assert
        assertThat(members).containsExactly(ClusterMember(idOf("ümlaut dir", "fïle.kt"), 1.0))
    }

    @Test
    fun `should give the same lens on two runs`() {
        // Arrange
        commitFile("a.kt", "1\n2\n")
        commitFile("b/c.kt", "1\n", author = "Bob <bob@x.org>")

        // Act
        val firstRun = AuthorOwnershipScan(repository).lens()
        val secondRun = AuthorOwnershipScan(repository).lens()

        // Assert
        assertThat(secondRun).isEqualTo(firstRun)
    }

    @Test
    fun `should tell a shallow clone from a full one`() {
        // Arrange
        commitFile("a.kt", "1\n")
        commitFile("a.kt", "2\n")
        val shallow = File(repository, "shallow")
        git("clone", "-q", "--depth=1", "file://${repository.absolutePath}", shallow.path)

        // Act
        val isFullShallow = AuthorOwnershipScan(repository).isShallowClone()
        val isCloneShallow = AuthorOwnershipScan(shallow).isShallowClone()

        // Assert
        assertThat(isFullShallow).isFalse()
        assertThat(isCloneShallow).isTrue()
    }
}
