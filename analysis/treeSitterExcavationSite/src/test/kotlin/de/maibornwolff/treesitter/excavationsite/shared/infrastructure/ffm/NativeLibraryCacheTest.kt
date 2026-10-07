package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.DisabledOnOs
import org.junit.jupiter.api.condition.OS
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.attribute.PosixFilePermissions
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import kotlin.io.path.listDirectoryEntries

class NativeLibraryCacheTest {
    private val linux = Platform("x86_64", "linux-gnu", "so")
    private val libraryContent = "library content".toByteArray()
    private val bundledLibraries = mapOf("lib/x86_64-linux-gnu-tree-sitter.so" to libraryContent)

    @TempDir
    lateinit var cacheDirectory: Path

    private fun cache(resources: Map<String, ByteArray> = bundledLibraries) = NativeLibraryCache(cacheDirectory, linux) { resources[it] }

    @Test
    fun `should unpack the bundled library into the cache directory`() {
        // Arrange
        val cache = cache()

        // Act
        val unpacked = cache.unpack("tree-sitter")

        // Assert
        assertThat(unpacked.parent).isEqualTo(cacheDirectory)
        assertThat(unpacked.fileName.toString()).isEqualTo("7f9960067cc11cc8-x86_64-linux-gnu-tree-sitter.so")
        assertThat(Files.readAllBytes(unpacked)).isEqualTo(libraryContent)
        assertThat(cacheDirectory.listDirectoryEntries()).containsExactly(unpacked)
    }

    @Test
    fun `should create the cache directory when it does not exist`() {
        // Arrange
        val missingDirectory = cacheDirectory.resolve("nested").resolve("cache")
        val cache = NativeLibraryCache(missingDirectory, linux) { bundledLibraries[it] }

        // Act
        val unpacked = cache.unpack("tree-sitter")

        // Assert
        assertThat(unpacked).exists().hasParentRaw(missingDirectory)
    }

    @Test
    @DisabledOnOs(OS.WINDOWS)
    fun `should let only the owner into a cache directory it creates`() {
        // Arrange
        val missingDirectory = cacheDirectory.resolve("cache")
        val cache = NativeLibraryCache(missingDirectory, linux) { bundledLibraries[it] }

        // Act
        cache.unpack("tree-sitter")

        // Assert
        assertThat(PosixFilePermissions.toString(Files.getPosixFilePermissions(missingDirectory))).isEqualTo("rwx------")
    }

    @Test
    @DisabledOnOs(OS.WINDOWS)
    fun `should refuse a cache directory other users can write to`() {
        // Arrange
        val sharedDirectory = Files.createDirectory(cacheDirectory.resolve("shared"))
        Files.setPosixFilePermissions(sharedDirectory, PosixFilePermissions.fromString("rwxrwxrwx"))
        val cache = NativeLibraryCache(sharedDirectory, linux) { bundledLibraries[it] }

        // Act & Assert
        assertThatThrownBy { cache.unpack("tree-sitter") }
            .isInstanceOf(UnsatisfiedLinkError::class.java)
            .hasMessageContaining("codecharta.treesitter.library.dir")
    }

    @Test
    @DisabledOnOs(OS.WINDOWS)
    fun `should refuse a cache directory that is a symbolic link`() {
        // Arrange
        val realDirectory = Files.createDirectory(cacheDirectory.resolve("real"))
        val linkedDirectory = Files.createSymbolicLink(cacheDirectory.resolve("link"), realDirectory)
        val cache = NativeLibraryCache(linkedDirectory, linux) { bundledLibraries[it] }

        // Act & Assert
        assertThatThrownBy { cache.unpack("tree-sitter") }.isInstanceOf(UnsatisfiedLinkError::class.java)
        assertThat(realDirectory.listDirectoryEntries()).isEmpty()
    }

    @Test
    fun `should reuse the file a previous run unpacked`() {
        // Arrange
        val firstUnpacked = cache().unpack("tree-sitter")
        val firstModification = Files.getLastModifiedTime(firstUnpacked)

        // Act
        val secondUnpacked = cache().unpack("tree-sitter")

        // Assert
        assertThat(secondUnpacked).isEqualTo(firstUnpacked)
        assertThat(Files.getLastModifiedTime(secondUnpacked)).isEqualTo(firstModification)
        assertThat(cacheDirectory.listDirectoryEntries()).hasSize(1)
    }

    @Test
    fun `should restore a cached file whose content was changed`() {
        // Arrange
        val unpacked = cache().unpack("tree-sitter")
        Files.write(unpacked, "tampered".toByteArray())

        // Act
        val restored = cache().unpack("tree-sitter")

        // Assert
        assertThat(Files.readAllBytes(restored)).isEqualTo(libraryContent)
    }

    @Test
    fun `should keep a different version of the library under its own name`() {
        // Arrange
        val olderVersion = cache().unpack("tree-sitter")
        val newerLibraries = mapOf("lib/x86_64-linux-gnu-tree-sitter.so" to "newer library content".toByteArray())

        // Act
        val newerVersion = cache(newerLibraries).unpack("tree-sitter")

        // Assert
        assertThat(newerVersion).isNotEqualTo(olderVersion)
        assertThat(Files.readAllBytes(olderVersion)).isEqualTo(libraryContent)
    }

    @Test
    fun `should unpack one intact file when many threads unpack at once`() {
        // Arrange
        val threadCount = 16
        val executor = Executors.newFixedThreadPool(threadCount)
        val unpackTasks = List(threadCount) { Callable { cache().unpack("tree-sitter") } }

        // Act
        val unpacked = executor.invokeAll(unpackTasks).map { it.get() }
        executor.shutdown()

        // Assert
        assertThat(unpacked.toSet()).hasSize(1)
        assertThat(Files.readAllBytes(unpacked.first())).isEqualTo(libraryContent)
        assertThat(cacheDirectory.listDirectoryEntries()).hasSize(1)
    }

    @Test
    fun `should name the missing file and the supported platforms when a library is not bundled`() {
        // Arrange
        val cache = cache(resources = emptyMap())

        // Act & Assert
        assertThatThrownBy { cache.unpack("tree-sitter") }
            .isInstanceOf(UnsatisfiedLinkError::class.java)
            .hasMessageContaining("lib/x86_64-linux-gnu-tree-sitter.so")
            .hasMessageContaining("Windows on x86_64")
    }

    @Test
    fun `should unpack the tree-sitter core library bundled for the current platform`() {
        // Arrange
        val cache = NativeLibraryCache(directory = cacheDirectory)
        val bundledFile = "lib/${Platform.current().libraryFileName("tree-sitter")}"
        val bundledContent = javaClass.classLoader.getResourceAsStream(bundledFile)!!.use { it.readAllBytes() }

        // Act
        val unpacked = cache.unpack("tree-sitter")

        // Assert
        assertThat(Files.readAllBytes(unpacked)).isEqualTo(bundledContent)
    }
}
