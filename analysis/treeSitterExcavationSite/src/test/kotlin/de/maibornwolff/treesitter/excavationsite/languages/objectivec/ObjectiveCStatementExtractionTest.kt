package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ObjectiveCStatementExtractionTest {
    @Test
    fun `should extract fast enumeration variable with pointer type`() {
        // Arrange
        val code = """
            void test() {
                for (NSString *item in array) {
                    NSLog(@"%@", item);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "item")
    }

    @Test
    fun `should extract fast enumeration variable with id type`() {
        // Arrange
        val code = """
            void test() {
                for (id key in dictionary) {
                    NSLog(@"%@", key);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "key")
    }

    @Test
    fun `should extract fast enumeration with explicit type`() {
        // Arrange
        val code = """
            void test() {
                for (NSDictionary *dict in dictionaries) {
                    process(dict);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "dict")
    }

    @Test
    fun `should extract catch exception variable`() {
        // Arrange
        val code = """
            void test() {
                @try {
                    [self riskyOperation];
                }
                @catch (NSException *exception) {
                    NSLog(@"Exception: %@", exception);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "exception")
    }

    @Test
    fun `should extract catch with different exception type`() {
        // Arrange
        val code = """
            void test() {
                @try {
                    riskyOperation();
                }
                @catch (NSError *error) {
                    handleError(error);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "error")
    }

    @Test
    fun `should extract multiple catch clauses`() {
        // Arrange
        val code = """
            void test() {
                @try {
                    riskyOperation();
                }
                @catch (NSInvalidArgumentException *argEx) {
                    handleArg(argEx);
                }
                @catch (NSException *ex) {
                    handleGeneric(ex);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "argEx", "ex")
    }

    @Test
    fun `should extract try-catch-finally variables`() {
        // Arrange
        val code = """
            void test() {
                @try {
                    [self riskyOperation];
                }
                @catch (NSException *exception) {
                    NSLog(@"%@", exception);
                }
                @finally {
                    [self cleanup];
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "exception")
    }

    @Test
    fun `should extract block parameters from block literal`() {
        // Arrange
        val code = """
            void test() {
                void (^myBlock)(NSString *, int) = ^(NSString *name, int count) {
                    NSLog(@"%@", name);
                };
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Block parameter names are extracted from block literals
        // Note: Block pointer variable names have complex declarator syntax
        assertThat(result.identifiers).containsExactly("test", "name", "count")
    }

    @Test
    fun `should extract enumeration block parameters`() {
        // Arrange
        val code = """
            void test() {
                [array enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
                    NSLog(@"%@", obj);
                }];
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "obj", "idx", "stop")
    }

    @Test
    fun `should extract block with single parameter`() {
        // Arrange
        val code = """
            void test() {
                void (^handler)(NSString *) = ^(NSString *message) {
                    NSLog(@"%@", message);
                };
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Block parameter names are extracted from block literals
        assertThat(result.identifiers).containsExactly("test", "message")
    }

    @Test
    fun `should extract completion handler block parameters`() {
        // Arrange
        val code = """
            void test() {
                [network fetchDataWithCompletion:^(NSData *data, NSError *error) {
                    if (error) {
                        handleError(error);
                    }
                }];
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "data", "error")
    }

    @Test
    fun `should handle nested blocks`() {
        // Arrange
        val code = """
            void test() {
                dispatch_async(queue, ^{
                    [array enumerateObjectsUsingBlock:^(id innerObj, NSUInteger innerIdx, BOOL *innerStop) {
                        process(innerObj);
                    }];
                });
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "innerObj", "innerIdx", "innerStop")
    }

    @Test
    fun `should handle multiple for-in loops`() {
        // Arrange
        val code = """
            void test() {
                for (NSString *key in keys) {
                    process(key);
                }
                for (id value in values) {
                    process(value);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "key", "value")
    }

    @Test
    fun `should handle block with no parameters`() {
        // Arrange
        val code = """
            void test() {
                dispatch_async(queue, ^{
                    doSomething();
                });
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test")
    }

    @Test
    fun `should handle nested for-in loops`() {
        // Arrange
        val code = """
            void test() {
                for (NSArray *innerArray in outerArray) {
                    for (NSString *item in innerArray) {
                        process(item);
                    }
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "innerArray", "item")
    }

    @Test
    fun `should handle nested try-catch blocks`() {
        // Arrange
        val code = """
            void test() {
                @try {
                    @try {
                        innerRisky();
                    }
                    @catch (NSException *innerEx) {
                        handleInner(innerEx);
                    }
                }
                @catch (NSException *outerEx) {
                    handleOuter(outerEx);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "innerEx", "outerEx")
    }

    @Test
    fun `should handle try with only finally no catch`() {
        // Arrange
        val code = """
            void test() {
                @try {
                    riskyOperation();
                }
                @finally {
                    cleanup();
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test")
    }

    @Test
    fun `should handle multiple blocks in same method`() {
        // Arrange
        val code = """
            void test() {
                dispatch_async(queue1, ^(void) {
                    firstTask();
                });
                dispatch_async(queue2, ^(void) {
                    secondTask();
                });
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test")
    }

    @Test
    fun `should handle for-in with dictionary`() {
        // Arrange
        val code = """
            void test() {
                NSDictionary *dict;
                for (NSString *key in dict) {
                    id value = dict[key];
                    process(key, value);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "dict", "key", "value")
    }

    @Test
    fun `should handle block with return type`() {
        // Arrange
        val code = """
            void test() {
                NSInteger (^sum)(NSInteger, NSInteger) = ^NSInteger(NSInteger a, NSInteger b) {
                    return a + b;
                };
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "a", "b")
    }

    @Test
    fun `should handle dispatch_once pattern`() {
        // Arrange
        val code = """
            @implementation Singleton
            + (instancetype)sharedInstance {
                static id instance;
                static dispatch_once_t onceToken;
                dispatch_once(&onceToken, ^{
                    instance = [[self alloc] init];
                });
                return instance;
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Singleton", "sharedInstance", "instance", "onceToken")
    }

    @Test
    fun `should handle deeply nested blocks`() {
        // Arrange
        val code = """
            void test() {
                dispatch_async(queue, ^{
                    [service fetchWithCompletion:^(NSData *data) {
                        [parser parseData:data completion:^(id result) {
                            handleResult(result);
                        }];
                    }];
                });
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "data", "result")
    }

    @Test
    fun `should handle at-autoreleasepool`() {
        // Arrange - Variables inside @autoreleasepool compound statement
        val code = """
            void test() {
                NSString *str;
                @autoreleasepool {
                    str = [[NSString alloc] init];
                    process(str);
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "str")
    }

    @Test
    fun `should handle at-synchronized`() {
        // Arrange
        val code = """
            void test() {
                @synchronized(self) {
                    int localVar = sharedCounter;
                    sharedCounter = localVar + 1;
                }
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "localVar")
    }
}
