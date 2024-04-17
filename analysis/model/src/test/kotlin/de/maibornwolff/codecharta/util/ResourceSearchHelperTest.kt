package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class ResourceSearchHelperTest {
// Tests for both functions
    @Test
    fun `should return false if given directory path does not exist`() {
        val input = "src/test/resources/my/doesNotExist"

        val resultFolder = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "dummyVal")
        val resultFile = ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(input, listOf("dummyVal"))

        Assertions.assertThat(resultFolder).isFalse()
        Assertions.assertThat(resultFile).isFalse()
    }

    @Test
    fun `should return false if input is empty string`() {
        val input = ""

        val resultFolder = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "dummyVal")
        val resultFile = ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(input, listOf("dummyVal"))

        Assertions.assertThat(resultFolder).isFalse()
        Assertions.assertThat(resultFile).isFalse()
    }

    // Tests for `isFolderDirectlyInGivenDirectory`
    @Test
    fun `should return true if folder exists in given directory path`() {
        val input = "src/test/resources/"

        val result = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "my")

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return true if given directory path is looked for folder`() {
        val input = "src/test/resources/my"

        val result = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "my")

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return false if input is no directory`() {
        val input = "src/test/resources/my/java/repo/dummyFile.java"

        val result = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "dummyFile.java")

        Assertions.assertThat(result).isFalse()
    }

    @Test
    fun `should return false if given directory path does not contain looked for folder`() {
        val input = "src/test/resources/"

        val result = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "doesNotExist")

        Assertions.assertThat(result).isFalse()
    }

    @Test
    fun `should return false if given directory path does not contain looked for folder at root level`() {
        val input = "src/test/resources/my/"

        val result = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "repo")

        Assertions.assertThat(result).isFalse()
    }

    @Test
    fun `should return false if given directory path does only contain file with looked for name`() {
        val input = "src/test/resources/my/java/repo"

        val result = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, "dummyFile.java")

        Assertions.assertThat(result).isFalse()
    }

    // Tests for `isFileWithOneOrMoreOfEndingsPresent`
    @Test
    fun `should return true if resource ends with one of the given endings and is file`() {
        val input = "src/test/resources/my/java/repo/dummyFile.java"

        val result = ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(input, listOf(".java"))

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return true if resource is directory and contains file ending with one of the given file endings`() {
        val input = "src/test/resources/my/"

        val result = ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(input, listOf(".java"))

        Assertions.assertThat(result).isTrue()
    }

    @Test
    fun `should return false if input does not end with given file endings and is no directory`() {
        val input = "src/test/resources/my/java/repo/dummyFile.java"

        val result = ResourceSearchHelper.isFolderDirectlyInGivenDirectory(input, ".html")

        Assertions.assertThat(result).isFalse()
    }

    @Test
    fun `should return false if resource is directory and contains no file ending with one of the given file endings`() {
        val input = "src/test/resources/my/other"

        val result = ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(input, listOf(".java"))

        Assertions.assertThat(result).isFalse()
    }

    @Test
    fun `should return false if resource is directory ending with one of the given file endings`() {
        val input = "src/test/resources/my/other/.java"

        val result = ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(input, listOf(".java"))

        Assertions.assertThat(result).isFalse()
    }

    @Test
    fun `should return false if resource is directory and contains another directory ending with one of the given file endings`() {
        val input = "src/test/resources/my/other/"

        val result = ResourceSearchHelper.isFileWithOneOrMoreOfEndingsPresent(input, listOf(".java"))

        Assertions.assertThat(result).isFalse()
    }
}
