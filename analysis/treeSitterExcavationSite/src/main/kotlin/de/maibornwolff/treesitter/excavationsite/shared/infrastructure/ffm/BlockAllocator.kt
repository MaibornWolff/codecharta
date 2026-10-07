package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

import java.lang.foreign.Arena
import java.lang.foreign.MemorySegment
import java.lang.foreign.SegmentAllocator

/** Hands out slices of 1 MiB blocks allocated from [arena]; everything is freed when the arena closes. */
internal class BlockAllocator(private val arena: Arena) : SegmentAllocator {
    private var block: MemorySegment = MemorySegment.NULL
    private var offset = 0L

    override fun allocate(byteSize: Long, byteAlignment: Long): MemorySegment {
        var aligned = (offset + byteAlignment - 1) and (byteAlignment - 1).inv()
        if (block == MemorySegment.NULL || aligned + byteSize > block.byteSize()) {
            block = arena.allocate(maxOf(BLOCK_SIZE, byteSize), maxOf(byteAlignment, 16))
            aligned = 0
        }
        offset = aligned + byteSize
        return block.asSlice(aligned, byteSize)
    }

    companion object {
        private const val BLOCK_SIZE = 1L shl 20
    }
}
