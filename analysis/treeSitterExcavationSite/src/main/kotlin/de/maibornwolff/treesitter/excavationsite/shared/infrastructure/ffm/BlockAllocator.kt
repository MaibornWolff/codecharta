package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import java.lang.foreign.Arena
import java.lang.foreign.MemorySegment
import java.lang.foreign.SegmentAllocator

/**
 * Hands out slices of 1 MiB blocks allocated from [arena]. Memory handed out after a [mark] can be given back with
 * [release] and is then reused; the blocks themselves are freed when the arena closes.
 */
internal class BlockAllocator(private val arena: Arena) : SegmentAllocator {
    private val blocks = ArrayList<MemorySegment>()
    private var blockIndex = 0
    private var offset = 0L

    override fun allocate(byteSize: Long, byteAlignment: Long): MemorySegment {
        if (byteSize > BLOCK_SIZE || byteAlignment > BLOCK_ALIGNMENT) return arena.allocate(byteSize, byteAlignment)

        var alignedOffset = (offset + byteAlignment - 1) and (byteAlignment - 1).inv()
        if (alignedOffset + byteSize > BLOCK_SIZE) {
            blockIndex++
            alignedOffset = 0
        }
        if (blockIndex == blocks.size) blocks.add(arena.allocate(BLOCK_SIZE, BLOCK_ALIGNMENT))
        offset = alignedOffset + byteSize
        return blocks[blockIndex].asSlice(alignedOffset, byteSize)
    }

    fun mark(): Long = (blockIndex.toLong() shl Int.SIZE_BITS) or offset

    /** Gives back everything allocated since [mark]; segments handed out since then must not be used any more. */
    fun release(mark: Long) {
        blockIndex = (mark ushr Int.SIZE_BITS).toInt()
        offset = mark and OFFSET_MASK
    }

    companion object {
        private const val BLOCK_SIZE = 1L shl 20
        private const val BLOCK_ALIGNMENT = 16L
        private const val OFFSET_MASK = 0xFFFFFFFFL
    }
}
