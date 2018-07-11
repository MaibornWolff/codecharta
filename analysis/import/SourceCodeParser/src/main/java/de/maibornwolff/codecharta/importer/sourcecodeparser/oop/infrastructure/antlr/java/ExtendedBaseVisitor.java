package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableSourceCode;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags;

public class ExtendedBaseVisitor extends JavaParserBaseVisitor {

    private TaggableSourceCode source;

    ExtendedBaseVisitor(TaggableSourceCode source){
        this.source = source;
    }

    @Override
    public Object visitPackageDeclaration(JavaParser.PackageDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.PACKAGE);
        return visitChildren(ctx);
    }

    @Override
    public Object visitImportDeclaration(JavaParser.ImportDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.IMPORT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitAnnotation(JavaParser.AnnotationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.ANNOTATION_INVOCATION);
        return visitChildren(ctx);
    }

    /**
     * --> @interface BlockingOperations {
     *          boolean fileSystemOperations();
     *     }
     */
    @Override
    public Object visitAnnotationTypeDeclaration(JavaParser.AnnotationTypeDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.ANNOTATION);
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
        source.addTag(ctx.getStart().getLine(), CodeTags.ANNOTATION_ELEMENT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.CLASS);
        return visitChildren(ctx);
    }

    @Override
    public Object visitInterfaceDeclaration(JavaParser.InterfaceDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.INTERFACE);
        return visitChildren(ctx);
    }

    @Override
    public Object visitEnumDeclaration(JavaParser.EnumDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.ENUM);
        return visitChildren(ctx);
    }

    @Override
    public Object visitConstructorDeclaration(JavaParser.ConstructorDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.CONSTRUCTOR);
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
        source.addTag(ctx.getStart().getLine(), CodeTags.RESOURCE);
        return visitChildren(ctx);
    }

    /*
     *  --> } catch (SQLException e) {
     *          JDBCTutorialUtilities.printSQLException(e);
     *      }
     */
    @Override
    public Object visitCatchClause(JavaParser.CatchClauseContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.CATCH);
        return visitChildren(ctx);
    }

    /*
     *  --> } finally{
     *          db.close();
     *      }
     */
    @Override
    public Object visitFinallyBlock(JavaParser.FinallyBlockContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.FINALLY);
        return visitChildren(ctx);
    }

    /*
     * public static void writeToFileZipFileContents(String zipFileName)
     * -->  throws IOException, NullPointerException
     */
    @Override
    public Object visitQualifiedNameList(JavaParser.QualifiedNameListContext ctx) {
        // qualifiedNameList is only used by the throws declaration
        source.addTag(ctx.getStart().getLine(), CodeTags.THROWS_DECLARATION);
        return visitChildren(ctx);
    }

    /*
     * switch (month) {
     * -->  case 1:
     *          break;
     * -->  default:
     *          break;
     */
    @Override
    public Object visitSwitchLabel(JavaParser.SwitchLabelContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.SWITCH_LABEL);
        return visitChildren(ctx);
    }


    //@Override public T visitSwitchBlockStatementGroup(JavaParser.SwitchBlockStatementGroupContext ctx) { return visitChildren(ctx); }

    /** Called when a constant in an interface is found **/
    @Override
    public Object visitConstDeclaration(JavaParser.ConstDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.INTERFACE_CONSTANT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitFieldDeclaration(JavaParser.FieldDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.CLASS_FIELD);
        return visitChildren(ctx);
    }

    @Override
    public Object visitInterfaceMethodDeclaration(JavaParser.InterfaceMethodDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.METHOD);
        return visitChildren(ctx);
    }

    @Override
    public Object visitMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.METHOD);
        return visitChildren(ctx);
    }

    @Override
    public Object visitVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.VARIABLE);
        return visitChildren(ctx);
    }

    @Override
    public Object visitStatement(JavaParser.StatementContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.STATEMENT);
        if(ctx.IF() != null) { source.addTag(ctx.getStart().getLine(), CodeTags.CONDITION);}
        if(ctx.ELSE() != null) { source.addTag(ctx.getStart().getLine(), CodeTags.CONDITION);}
        return visitChildren(ctx);
    }

    @Override
    public Object visitEnumConstant(JavaParser.EnumConstantContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.ENUM_CONSTANT);
        return visitChildren(ctx);
    }

    @Override
    public Object visitExpression(JavaParser.ExpressionContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.EXPRESSION);
        return visitChildren(ctx);
    }

    @Override
    public Object visitMethodCall(JavaParser.MethodCallContext ctx) {
        source.addTag(ctx.getStart().getLine(), CodeTags.METHOD_CALL);
        return visitChildren(ctx);
    }

}
