package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import java.lang.foreign.Arena
import java.lang.foreign.MemorySegment
import java.lang.foreign.SegmentAllocator

/**
 * Hands out slices of blocks allocated from [arena]: the first of 16 KiB, each next one twice as large up to 1 MiB, as
 * most trees need little and every block is zeroed when it is allocated. Memory handed out after a [mark] can be given
 * back with [release] and is then reused; the blocks themselves are freed when the arena closes.
 */
internal class BlockAllocator(private val arena: Arena) : SegmentAllocator {
    private val blocks = ArrayList<MemorySegment>()
    private var blockIndex = 0
    private var offset = 0L

    override fun allocate(byteSize: Long, byteAlignment: Long): MemorySegment {
        if (byteSize > LARGEST_BLOCK_SIZE || byteAlignment > BLOCK_ALIGNMENT) return arena.allocate(byteSize, byteAlignment)

        var alignedOffset = (offset + byteAlignment - 1) and (byteAlignment - 1).inv()
        while (alignedOffset + byteSize > blockSize(blockIndex)) {
            blockIndex++
            alignedOffset = 0
        }
        while (blockIndex >= blocks.size) blocks.add(arena.allocate(blockSize(blocks.size), BLOCK_ALIGNMENT))
        offset = alignedOffset + byteSize
        return blocks[blockIndex].asSlice(alignedOffset, byteSize)
    }

    fun mark(): Long = (blockIndex.toLong() shl Int.SIZE_BITS) or offset

    /** Gives back everything allocated since [mark]; segments handed out since then must not be used any more. */
    fun release(mark: Long) {
        blockIndex = (mark ushr Int.SIZE_BITS).toInt()
        offset = mark and OFFSET_MASK
    }

    private fun blockSize(index: Int): Long = FIRST_BLOCK_SIZE shl minOf(index, DOUBLINGS_TO_LARGEST_BLOCK)

    companion object {
        private const val FIRST_BLOCK_SIZE = 1L shl 14
        private const val DOUBLINGS_TO_LARGEST_BLOCK = 6
        private const val LARGEST_BLOCK_SIZE = FIRST_BLOCK_SIZE shl DOUBLINGS_TO_LARGEST_BLOCK
        private const val BLOCK_ALIGNMENT = 16L
        private const val OFFSET_MASK = 0xFFFFFFFFL
    }
}
