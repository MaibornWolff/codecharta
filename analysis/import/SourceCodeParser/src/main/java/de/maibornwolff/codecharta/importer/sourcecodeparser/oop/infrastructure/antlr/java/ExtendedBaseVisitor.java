package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.TagableSourceCode;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.BranchTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.MethodTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.UnsortedCodeTags;

public class ExtendedBaseVisitor extends JavaParserBaseVisitor {

    private TagableSourceCode source;

    ExtendedBaseVisitor(TagableSourceCode source){
        this.source = source;
    }

    @Override
    public Object visitPackageDeclaration(JavaParser.PackageDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.PACKAGE);
        return visitChildren(ctx);
    }

    @Override
    public Object visitImportDeclaration(JavaParser.ImportDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.IMPORT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitAnnotation(JavaParser.AnnotationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.ANNOTATION_INVOCATION);
        return visitChildren(ctx);
    }

    /**
     * --> @interface BlockingOperations {
     *          boolean fileSystemOperations();
     *     }
     */
    @Override
    public Object visitAnnotationTypeDeclaration(JavaParser.AnnotationTypeDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.ANNOTATION);
        return visitChildren(ctx);
    }

    /**
     *     @interface BlockingOperations {
     * -->      boolean fileSystemOperations();
     * -->      boolean networkOperations() default false;
     *     }
     */
    @Override
    public Object visitAnnotationTypeElementDeclaration(JavaParser.AnnotationTypeElementDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.ANNOTATION_ELEMENT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.CLASS);
        return visitChildren(ctx);
    }

    @Override
    public Object visitInterfaceDeclaration(JavaParser.InterfaceDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.INTERFACE);
        return visitChildren(ctx);
    }

    @Override
    public Object visitEnumDeclaration(JavaParser.EnumDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.ENUM);
        return visitChildren(ctx);
    }

    @Override
    public Object visitConstructorDeclaration(JavaParser.ConstructorDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.CONSTRUCTOR);
        return visitChildren(ctx);
    }

    /*
     * try (
     *  -->    java.util.zip.ZipFile zf =
     *               new java.util.zip.ZipFile(zipFileName);
     *  -->    java.io.BufferedWriter writer =
     *               java.nio.file.Files.newBufferedWriter(outputFilePath, charset)
     *     )
     */
    @Override
    public Object visitResource(JavaParser.ResourceContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.RESOURCE);
        return visitChildren(ctx);
    }

    /*
     *  --> } catch (SQLException e) {
     *          JDBCTutorialUtilities.printSQLException(e);
     *      }
     */
    @Override
    public Object visitCatchClause(JavaParser.CatchClauseContext ctx) {
        source.addTag(ctx.getStart().getLine(), BranchTags.CATCH);
        return visitChildren(ctx);
    }

    /**
     *  --> } finally{
     *          db.close();
     *      }
     */
    @Override
    public Object visitFinallyBlock(JavaParser.FinallyBlockContext ctx) {
        switch (""){

        }

        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.FINALLY);
        return visitChildren(ctx);
    }

    /*
     * public static void writeToFileZipFileContents(String zipFileName)
     * -->  throws IOException, NullPointerException
     */
    @Override
    public Object visitQualifiedNameList(JavaParser.QualifiedNameListContext ctx) {
        // qualifiedNameList is only used by the throws declaration
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.THROWS_DECLARATION);
        return visitChildren(ctx);
    }

    /**
     * switch (month) {
     * -->  case 1:
     *          break;
     * -->  default:
     *          break;
     */
    @Override
    public Object visitSwitchLabel(JavaParser.SwitchLabelContext ctx) {
        CodeTags codeTag = BranchTags.CASE;
        if(ctx.DEFAULT() != null) {
            codeTag = UnsortedCodeTags.DEFAULT_CASE;
        }
        source.addTag(ctx.getStart().getLine(), codeTag);
        return visitChildren(ctx);
    }

    /**
     * --> if (obj == null)
     * --> while (obj == null)
     *      do { sth();
     * -->  } while(obj == null)
     * -->  switch (ch) {
     *          case 'A': ....
     */
    @Override
    public Object visitParExpression(JavaParser.ParExpressionContext ctx) {
        if(isMcCabeBranchStatement(ctx)){
            source.addTag(ctx.getStart().getLine(), BranchTags.CONDITION);
        }
        return visitChildren(ctx);
    }

    private boolean isMcCabeBranchStatement(JavaParser.ParExpressionContext ctx){
        boolean parentIsNotSwitch = false;
        if(ctx.getParent() instanceof JavaParser.StatementContext){
            JavaParser.StatementContext statement = (JavaParser.StatementContext)ctx.getParent();
            if(statement.SWITCH() == null && statement.SYNCHRONIZED() == null){
                parentIsNotSwitch = true;
            }
        }
        return parentIsNotSwitch;
    }

    /**
     * --> for (int i = 0; i < 5; i++){
     *         doStuff();
     *     }
     * --> for(String element : list)
     *          doSth();
     *     }
     */
    @Override
    public Object visitForControl(JavaParser.ForControlContext ctx) {
        source.addTag(ctx.getStart().getLine(), BranchTags.CONDITION);
        return visitChildren(ctx);
    }

    /** Called when a constant in an interface is found **/
    @Override
    public Object visitConstDeclaration(JavaParser.ConstDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.INTERFACE_CONSTANT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitFieldDeclaration(JavaParser.FieldDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.CLASS_FIELD);
        return visitChildren(ctx);
    }

    @Override
    public Object visitInterfaceMethodDeclaration(JavaParser.InterfaceMethodDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), MethodTags.METHOD);
        return visitChildren(ctx);
    }

    @Override
    public Object visitMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), MethodTags.METHOD);
        return visitChildren(ctx);
    }

    @Override
    public Object visitVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.VARIABLE);
        return visitChildren(ctx);
    }

    @Override
    public Object visitStatement(JavaParser.StatementContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.STATEMENT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitEnumConstant(JavaParser.EnumConstantContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.ENUM_CONSTANT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitExpression(JavaParser.ExpressionContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.EXPRESSION);
        if(ctx.bop != null){
            if(ctx.bop.getText().equals("||")){
                source.addTag(ctx.getStart().getLine(), BranchTags.OR_CONDITION);
            } else if(ctx.bop.getText().equals("&&")){
                source.addTag(ctx.getStart().getLine(), BranchTags.AND_CONDITION);
            }else if(ctx.bop.getText().equals("?")){
                source.addTag(ctx.getStart().getLine(), BranchTags.TENARY_CONDITION);
            }
        }
        return visitChildren(ctx);
    }

    @Override
    public Object visitMethodCall(JavaParser.MethodCallContext ctx) {
        source.addTag(ctx.getStart().getLine(), UnsortedCodeTags.METHOD_CALL);
        return visitChildren(ctx);
    }

}
