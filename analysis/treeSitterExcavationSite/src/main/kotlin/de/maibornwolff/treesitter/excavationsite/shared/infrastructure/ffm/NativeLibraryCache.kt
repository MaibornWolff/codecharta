package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import java.io.IOException
import java.nio.file.Files
import java.nio.file.LinkOption
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.nio.file.attribute.PosixFileAttributeView
import java.nio.file.attribute.PosixFileAttributes
import java.nio.file.attribute.PosixFilePermission
import java.nio.file.attribute.PosixFilePermissions
import java.nio.file.attribute.UserPrincipal
import java.security.MessageDigest
import java.util.HexFormat

/**
 * Unpacks the native libraries bundled on the classpath into a directory that outlives the process.
 *
 * A file is named after the checksum of its content, so a library is unpacked once per version instead of once per
 * run, and concurrent processes can only ever write identical bytes to the same name. Windows cannot delete a
 * loaded DLL, so a temp directory per run would pile up there. The directory defaults to one per user below the
 * temp directory; `-Dcodecharta.treesitter.library.dir` names another one.
 */
internal class NativeLibraryCache(
    private val directory: Path = defaultDirectory(),
    private val platform: Platform = Platform.current(),
    private val readResource: (String) -> ByteArray? = ::readClasspathResource
) {
    private val privateDirectory: Path by lazy {
        createPrivately(directory)
        requireOwnedByThisUserOnly(directory)
        directory
    }

    fun unpack(baseName: String): Path {
        val fileName = platform.libraryFileName(baseName)
        val content = readResource("$RESOURCE_FOLDER/$fileName")
            ?: throw UnsatisfiedLinkError(
                "Native library $RESOURCE_FOLDER/$fileName is not bundled; the tree-sitter parsers support " +
                    "Linux and macOS on x86_64 and aarch64, and Windows on x86_64"
            )
        val target = privateDirectory.resolve("${checksum(content)}-$fileName")
        if (!holds(target, content)) write(content, target)
        return target
    }

    private fun holds(file: Path, content: ByteArray): Boolean =
        Files.isRegularFile(file) && Files.readAllBytes(file).contentEquals(content)

    private fun write(content: ByteArray, target: Path) {
        val partial = Files.createTempFile(directory, target.fileName.toString(), PARTIAL_SUFFIX)
        try {
            Files.write(partial, content)
            Files.move(partial, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING)
        } catch (failure: IOException) {
            // Windows refuses to replace a library another process has loaded; that copy is as good as ours.
            if (!holds(target, content)) throw failure
        } finally {
            Files.deleteIfExists(partial)
        }
    }

    private fun createPrivately(newDirectory: Path) {
        if (Files.exists(newDirectory, LinkOption.NOFOLLOW_LINKS)) return
        Files.createDirectories(newDirectory)
        if (posixAttributes(newDirectory) != null) Files.setPosixFilePermissions(newDirectory, OWNER_ONLY)
    }

    // A library is loaded from here, so nobody else may be able to replace a file after its content was checked.
    private fun requireOwnedByThisUserOnly(cacheDirectory: Path) {
        val attributes = posixAttributes(cacheDirectory) ?: return
        val writableByOthers = attributes.permissions().any { it in WRITE_BY_OTHERS }
        if (attributes.isDirectory && attributes.owner() == currentUser() && !writableByOthers) return
        throw UnsatisfiedLinkError(
            "$cacheDirectory must be a directory that only you can write to, because the tree-sitter libraries are " +
                "loaded from it; remove it or name another one with -D$DIRECTORY_PROPERTY=<directory>"
        )
    }

    private fun posixAttributes(path: Path): PosixFileAttributes? =
        Files.getFileAttributeView(path, PosixFileAttributeView::class.java, LinkOption.NOFOLLOW_LINKS)?.readAttributes()

    private fun currentUser(): UserPrincipal {
        val ownFile = Files.createTempFile(OWNER_PROBE_PREFIX, null)
        try {
            return Files.getOwner(ownFile)
        } finally {
            Files.delete(ownFile)
        }
    }

    private fun checksum(content: ByteArray): String =
        HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content)).take(CHECKSUM_LENGTH)

    companion object {
        private const val RESOURCE_FOLDER = "lib"
        private const val PARTIAL_SUFFIX = ".partial"
        private const val CHECKSUM_LENGTH = 16
        private const val DIRECTORY_PROPERTY = "codecharta.treesitter.library.dir"
        private const val OWNER_PROBE_PREFIX = "codecharta-owner"
        private val OWNER_ONLY = PosixFilePermissions.fromString("rwx------")
        private val WRITE_BY_OTHERS = setOf(PosixFilePermission.GROUP_WRITE, PosixFilePermission.OTHERS_WRITE)

        private fun defaultDirectory(): Path {
            val configured = System.getProperty(DIRECTORY_PROPERTY)
            if (configured != null) return Path.of(configured)
            return Path.of(System.getProperty("java.io.tmpdir"), "codecharta-tree-sitter-${System.getProperty("user.name")}")
        }

        private fun readClasspathResource(name: String): ByteArray? =
            NativeLibraryCache::class.java.classLoader.getResourceAsStream(name)?.use { it.readAllBytes() }
    }
}
