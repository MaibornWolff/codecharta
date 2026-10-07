package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm;

import static java.lang.foreign.ValueLayout.ADDRESS;
import static java.lang.foreign.ValueLayout.JAVA_BOOLEAN;
import static java.lang.foreign.ValueLayout.JAVA_CHAR;
import static java.lang.foreign.ValueLayout.JAVA_INT;

import java.lang.foreign.FunctionDescriptor;
import java.lang.foreign.Linker;
import java.lang.foreign.MemoryLayout;
import java.lang.foreign.MemorySegment;
import java.lang.foreign.SegmentAllocator;
import java.lang.foreign.StructLayout;
import java.lang.foreign.SymbolLookup;
import java.lang.foreign.ValueLayout;
import java.lang.invoke.MethodHandle;

/**
 * Downcalls into the tree-sitter C API, for the functions metric calculation needs.
 *
 * <p>The struct layouts mirror {@code tree_sitter/api.h} of tree-sitter 0.26 and have to be checked against it on
 * every upgrade of the core library. This is Java because Kotlin compiles {@code invokeExact} without its
 * polymorphic signature once it targets an older JDK release than the one it builds with.
 */
final class TreeSitterApi {
    /** {@code TSSymbol} is a {@code uint16_t}, which is Java's {@code char}. */
    private static final ValueLayout.OfChar SYMBOL = JAVA_CHAR;

    /** {@code TSNode { uint32_t context[4]; const void *id; const TSTree *tree; }} */
    static final StructLayout NODE = MemoryLayout.structLayout(
        MemoryLayout.sequenceLayout(4, JAVA_INT).withName("context"),
        ADDRESS.withName("id"),
        ADDRESS.withName("tree")
    );
    static final long NODE_ID_OFFSET = NODE.byteOffset(MemoryLayout.PathElement.groupElement("id"));

    /** {@code TSPoint { uint32_t row; uint32_t column; }} */
    static final StructLayout POINT = MemoryLayout.structLayout(JAVA_INT.withName("row"), JAVA_INT.withName("column"));
    static final long POINT_ROW_OFFSET = POINT.byteOffset(MemoryLayout.PathElement.groupElement("row"));
    static final long POINT_COLUMN_OFFSET = POINT.byteOffset(MemoryLayout.PathElement.groupElement("column"));

    /** {@code TSTreeCursor { const void *tree; const void *id; uint32_t context[3]; }}, padded to its alignment. */
    static final StructLayout CURSOR = MemoryLayout.structLayout(
        ADDRESS.withName("tree"),
        ADDRESS.withName("id"),
        MemoryLayout.sequenceLayout(3, JAVA_INT).withName("context"),
        MemoryLayout.paddingLayout(4)
    );

    private static final Linker LINKER = Linker.nativeLinker();
    private static final SymbolLookup CORE = NativeTreeSitter.INSTANCE.library("tree-sitter");

    private static final MethodHandle PARSER_NEW = core("ts_parser_new", FunctionDescriptor.of(ADDRESS));
    private static final MethodHandle PARSER_DELETE = core("ts_parser_delete", FunctionDescriptor.ofVoid(ADDRESS));
    private static final MethodHandle PARSER_SET_LANGUAGE =
        core("ts_parser_set_language", FunctionDescriptor.of(JAVA_BOOLEAN, ADDRESS, ADDRESS));
    private static final MethodHandle PARSER_PARSE_STRING =
        core("ts_parser_parse_string", FunctionDescriptor.of(ADDRESS, ADDRESS, ADDRESS, ADDRESS, JAVA_INT));
    private static final MethodHandle TREE_DELETE = core("ts_tree_delete", FunctionDescriptor.ofVoid(ADDRESS));
    private static final MethodHandle TREE_ROOT_NODE = core("ts_tree_root_node", FunctionDescriptor.of(NODE, ADDRESS));
    private static final MethodHandle CURSOR_NEW = core("ts_tree_cursor_new", FunctionDescriptor.of(CURSOR, NODE));
    private static final MethodHandle CURSOR_DELETE = core("ts_tree_cursor_delete", FunctionDescriptor.ofVoid(ADDRESS));
    private static final MethodHandle CURSOR_CURRENT_NODE =
        core("ts_tree_cursor_current_node", FunctionDescriptor.of(NODE, ADDRESS));
    private static final MethodHandle CURSOR_GOTO_FIRST_CHILD =
        core("ts_tree_cursor_goto_first_child", FunctionDescriptor.of(JAVA_BOOLEAN, ADDRESS));
    private static final MethodHandle CURSOR_GOTO_NEXT_SIBLING =
        core("ts_tree_cursor_goto_next_sibling", FunctionDescriptor.of(JAVA_BOOLEAN, ADDRESS));
    private static final MethodHandle CURSOR_GOTO_PARENT =
        core("ts_tree_cursor_goto_parent", FunctionDescriptor.of(JAVA_BOOLEAN, ADDRESS));
    private static final MethodHandle NODE_SYMBOL = core("ts_node_symbol", FunctionDescriptor.of(SYMBOL, NODE));
    private static final MethodHandle NODE_START_POINT = core("ts_node_start_point", FunctionDescriptor.of(POINT, NODE));
    private static final MethodHandle NODE_END_POINT = core("ts_node_end_point", FunctionDescriptor.of(POINT, NODE));
    private static final MethodHandle NODE_CHILD_COUNT = core("ts_node_child_count", FunctionDescriptor.of(JAVA_INT, NODE));
    private static final MethodHandle NODE_CHILD = core("ts_node_child", FunctionDescriptor.of(NODE, NODE, JAVA_INT));
    private static final MethodHandle NODE_PARENT = core("ts_node_parent", FunctionDescriptor.of(NODE, NODE));
    private static final MethodHandle NODE_CHILD_BY_FIELD_NAME =
        core("ts_node_child_by_field_name", FunctionDescriptor.of(NODE, NODE, ADDRESS, JAVA_INT));
    private static final MethodHandle LANGUAGE_SYMBOL_COUNT =
        core("ts_language_symbol_count", FunctionDescriptor.of(JAVA_INT, ADDRESS));
    private static final MethodHandle LANGUAGE_SYMBOL_NAME =
        core("ts_language_symbol_name", FunctionDescriptor.of(ADDRESS, ADDRESS, SYMBOL));

    private TreeSitterApi() {}

    private static MethodHandle core(String name, FunctionDescriptor descriptor) {
        return LINKER.downcallHandle(find(CORE, name), descriptor);
    }

    private static MemorySegment find(SymbolLookup library, String name) {
        return library.find(name).orElseThrow(() -> new UnsatisfiedLinkError(name + " not found"));
    }

    /** Calls the {@code TSLanguage *tree_sitter_<name>(void)} function a grammar library exports. */
    static MemorySegment language(SymbolLookup grammarLibrary, String entryPoint) {
        MethodHandle entry = LINKER.downcallHandle(find(grammarLibrary, entryPoint), FunctionDescriptor.of(ADDRESS));
        try {
            return (MemorySegment) entry.invokeExact();
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment parserNew() {
        try {
            return (MemorySegment) PARSER_NEW.invokeExact();
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static void parserDelete(MemorySegment parser) {
        try {
            PARSER_DELETE.invokeExact(parser);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static boolean parserSetLanguage(MemorySegment parser, MemorySegment language) {
        try {
            return (boolean) PARSER_SET_LANGUAGE.invokeExact(parser, language);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment parserParseString(MemorySegment parser, MemorySegment source, int length) {
        try {
            return (MemorySegment) PARSER_PARSE_STRING.invokeExact(parser, MemorySegment.NULL, source, length);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static void treeDelete(MemorySegment tree) {
        try {
            TREE_DELETE.invokeExact(tree);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment treeRootNode(SegmentAllocator allocator, MemorySegment tree) {
        try {
            return (MemorySegment) TREE_ROOT_NODE.invokeExact(allocator, tree);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment cursorNew(SegmentAllocator allocator, MemorySegment node) {
        try {
            return (MemorySegment) CURSOR_NEW.invokeExact(allocator, node);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static void cursorDelete(MemorySegment cursor) {
        try {
            CURSOR_DELETE.invokeExact(cursor);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment cursorCurrentNode(SegmentAllocator allocator, MemorySegment cursor) {
        try {
            return (MemorySegment) CURSOR_CURRENT_NODE.invokeExact(allocator, cursor);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static boolean cursorGotoFirstChild(MemorySegment cursor) {
        try {
            return (boolean) CURSOR_GOTO_FIRST_CHILD.invokeExact(cursor);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static boolean cursorGotoNextSibling(MemorySegment cursor) {
        try {
            return (boolean) CURSOR_GOTO_NEXT_SIBLING.invokeExact(cursor);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static boolean cursorGotoParent(MemorySegment cursor) {
        try {
            return (boolean) CURSOR_GOTO_PARENT.invokeExact(cursor);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static char nodeSymbol(MemorySegment node) {
        try {
            return (char) NODE_SYMBOL.invokeExact(node);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment nodeStartPoint(SegmentAllocator allocator, MemorySegment node) {
        try {
            return (MemorySegment) NODE_START_POINT.invokeExact(allocator, node);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment nodeEndPoint(SegmentAllocator allocator, MemorySegment node) {
        try {
            return (MemorySegment) NODE_END_POINT.invokeExact(allocator, node);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static int nodeChildCount(MemorySegment node) {
        try {
            return (int) NODE_CHILD_COUNT.invokeExact(node);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment nodeChild(SegmentAllocator allocator, MemorySegment node, int index) {
        try {
            return (MemorySegment) NODE_CHILD.invokeExact(allocator, node, index);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment nodeParent(SegmentAllocator allocator, MemorySegment node) {
        try {
            return (MemorySegment) NODE_PARENT.invokeExact(allocator, node);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment nodeChildByFieldName(SegmentAllocator allocator, MemorySegment node, MemorySegment name, int nameLength) {
        try {
            return (MemorySegment) NODE_CHILD_BY_FIELD_NAME.invokeExact(allocator, node, name, nameLength);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static int languageSymbolCount(MemorySegment language) {
        try {
            return (int) LANGUAGE_SYMBOL_COUNT.invokeExact(language);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    static MemorySegment languageSymbolName(MemorySegment language, char symbol) {
        try {
            return (MemorySegment) LANGUAGE_SYMBOL_NAME.invokeExact(language, symbol);
        } catch (Throwable failure) {
            throw rethrow(failure);
        }
    }

    private static RuntimeException rethrow(Throwable failure) {
        if (failure instanceof RuntimeException runtimeException) return runtimeException;
        if (failure instanceof Error error) throw error;
        return new IllegalStateException(failure);
    }
}
