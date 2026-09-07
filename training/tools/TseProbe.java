// Prints what TreeSitterExcavationSite (TSE) extracts from a file, to tell TSE gaps from CodeCharta resolver gaps.
// javac -cp analysis/build/install/codecharta-analysis/lib/ccsh-*.jar TseProbe.java
// java -cp analysis/build/install/codecharta-analysis/lib/ccsh-*.jar:. TseProbe KOTLIN path/File.kt CPP path/File.hpp ...
// Languages with TSE dependency support: JAVA KOTLIN TYPESCRIPT TSX JAVASCRIPT CSHARP CPP DELPHI RUST.
// TSE is the analysis module :treeSitterExcavationSite; its own jar
// (analysis/treeSitterExcavationSite/build/libs/*.jar, plus the tree-sitter jars it resolves) works as a
// classpath too, but the fat jar above needs no dependency resolution.
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies;
import de.maibornwolff.treesitter.excavationsite.shared.domain.*;
import java.nio.file.*;

public class TseProbe {
    public static void main(String[] args) throws Exception {
        for (int i = 0; i + 1 < args.length; i += 2) {
            Language lang = Language.valueOf(args[i]);
            Path file = Paths.get(args[i + 1]);
            System.out.println("##### " + lang + " " + file.getFileName());
            DependencyResult r = TreeSitterDependencies.INSTANCE.analyze(Files.readString(file), lang);
            System.out.println("package=" + r.getPackagePath());
            for (ImportDeclaration imp : r.getImports())
                System.out.println("  import path=" + imp.getPath() + " wildcard=" + imp.isWildcard() + " ns=" + imp.getNamespacePath() + " kind=" + imp.getKind() + " binding=" + imp.getBindingName());
            for (Declaration d : r.getDeclarations()) {
                System.out.println("  decl " + d.getType() + " " + d.getName() + " parent=" + d.getParentPath());
                for (UsedType t : d.getUsedTypes())
                    System.out.println("      used " + t.getName() + " prefix=" + t.getNamespacePrefix() + (t.getGenericTypes().isEmpty() ? "" : " generics=" + t.getGenericTypes().stream().map(UsedType::getName).toList()));
            }
        }
    }
}
