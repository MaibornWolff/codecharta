package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.lang.foreign.Arena
import java.lang.foreign.ValueLayout.JAVA_LONG

class BlockAllocatorTest {
    @Test
    fun `should hand out segments that do not overlap`() {
        Arena.ofConfined().use { arena ->
            // Arrange
            val allocator = BlockAllocator(arena)

            // Act
            val first = allocator.allocate(JAVA_LONG)
            val second = allocator.allocate(JAVA_LONG)
            first.set(JAVA_LONG, 0, 1L)
            second.set(JAVA_LONG, 0, 2L)

            // Assert
            assertThat(first.get(JAVA_LONG, 0)).isEqualTo(1L)
            assertThat(second.address()).isEqualTo(first.address() + JAVA_LONG.byteSize())
        }
    }

    @Test
    fun `should align a segment to the requested alignment`() {
        Arena.ofConfined().use { arena ->
            // Arrange
            val allocator = BlockAllocator(arena)
            val alignment = 8L
            allocator.allocate(1, 1)

            // Act
            val aligned = allocator.allocate(alignment, alignment)

            // Assert
            assertThat(aligned.address() % alignment).isZero()
        }
    }

    @Test
    fun `should start a new block when the current one is full`() {
        Arena.ofConfined().use { arena ->
            // Arrange
            val allocator = BlockAllocator(arena)
            val halfBlock = 600L * 1024
            val first = allocator.allocate(halfBlock, 1)

            // Act
            val second = allocator.allocate(halfBlock, 1)

            // Assert
            assertThat(second.byteSize()).isEqualTo(halfBlock)
            assertThat(second.address()).isNotEqualTo(first.address() + halfBlock)
        }
    }

    @Test
    fun `should allocate a segment larger than a block`() {
        Arena.ofConfined().use { arena ->
            // Arrange
            val allocator = BlockAllocator(arena)
            val largerThanBlock = 3L * 1024 * 1024

            // Act
            val segment = allocator.allocate(largerThanBlock, 1)

            // Assert
            assertThat(segment.byteSize()).isEqualTo(largerThanBlock)
        }
    }
}
