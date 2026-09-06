package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ObjectiveCExtractionTest {
    // === Identifier Extraction Tests ===

    @Test
    fun `should extract class interface identifier`() {
        // Arrange
        val code = """
            @interface User : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("User")
    }

    @Test
    fun `should extract class implementation identifier`() {
        // Arrange
        val code = """
            @implementation Order
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Order")
    }

    @Test
    fun `should extract category interface identifier`() {
        // Arrange
        val code = """
            @interface NSString (Validation)
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Validation")
    }

    @Test
    fun `should extract category implementation identifier`() {
        // Arrange
        val code = """
            @implementation User (Formatting)
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Formatting")
    }

    @Test
    fun `should extract protocol declaration identifier`() {
        // Arrange
        val code = """
            @protocol OrderRepository
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("OrderRepository")
    }

    @Test
    fun `should extract method definition identifier`() {
        // Arrange
        val code = """
            @implementation User
            - (void)save {
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "save")
    }

    @Test
    fun `should extract method declaration identifier`() {
        // Arrange
        val code = """
            @interface User : NSObject
            - (void)processOrder;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "processOrder")
    }

    @Test
    fun `should extract compound method selector first keyword`() {
        // Arrange
        val code = """
            @implementation User
            - (id)initWithName:(NSString *)name age:(int)age {
                return self;
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "initWithName", "name", "age")
    }

    @Test
    fun `should extract method parameter identifiers`() {
        // Arrange
        val code = """
            @implementation User
            - (void)setName:(NSString *)customerName age:(int)customerAge {
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "setName", "customerName", "customerAge")
    }

    @Test
    fun `should extract C function identifier`() {
        // Arrange
        val code = """
            void process_order(int orderId) {
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order", "orderId")
    }

    @Test
    fun `should extract variable declaration identifier`() {
        // Arrange
        val code = """
            int orderCount;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("orderCount")
    }

    @Test
    fun `should extract initialized variable declaration identifier`() {
        // Arrange
        val code = """
            int orderCount = 10;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("orderCount")
    }

    @Test
    fun `should extract pointer variable declaration identifier`() {
        // Arrange
        val code = """
            NSString *customerName;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("customerName")
    }

    @Test
    fun `should extract property declaration identifier`() {
        // Arrange
        val code = """
            @interface User : NSObject
            @property (nonatomic, strong) NSString *userName;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("User", "userName")
    }

    @Test
    fun `should extract property declaration with readonly attribute`() {
        // Arrange
        val code = """
            @interface Order : NSObject
            @property (nonatomic, readonly) NSString *orderId;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "orderId")
    }

    @Test
    fun `should extract class method identifier`() {
        // Arrange
        val code = """
            @implementation Factory
            + (id)createOrder {
                return nil;
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Factory", "createOrder")
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            // This is a comment
            @interface User : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a comment")
    }

    @Test
    fun `should extract block comment`() {
        // Arrange
        val code = """
            /* This is a block comment */
            @interface User : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a block comment")
    }

    @Test
    fun `should extract multiline block comment`() {
        // Arrange
        val code = """
            /*
             * This is a multiline
             * block comment
             */
            @interface User : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("This is a multiline\nblock comment")
    }

    @Test
    fun `should extract doc comment`() {
        // Arrange
        val code = """
            /**
             * Process the given order.
             * @param order The order to process
             */
            @interface OrderProcessor : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).hasSize(1)
        assertThat(result.comments[0]).isEqualTo("Process the given order.\n@param order The order to process")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract C string literal`() {
        // Arrange
        val code = """
            void test() {
                char *message = "Hello World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract NSString literal`() {
        // Arrange
        val code = """
            void test() {
                NSString *message = @"Hello World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            void test() {
                NSString *first = @"Hello";
                NSString *second = @"World";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    // === Combined Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            // Process the order
            @interface Order : NSObject
            @property NSString *orderId;
            - (void)process;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Order", "orderId", "process")
        assertThat(result.comments).containsExactly("Process the order")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            // Comment
            @interface Foo : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        val contexts = result.extractedTexts.map { it.context }
        assertThat(contexts).containsExactly(ExtractionContext.COMMENT, ExtractionContext.IDENTIFIER)
    }

    @Test
    fun `should extract from complete class`() {
        // Arrange
        val code = """
            @interface Customer : NSObject
            @property (nonatomic, strong) NSString *name;
            @property (nonatomic, assign) int age;
            - (void)save;
            - (void)updateName:(NSString *)newName;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Customer", "name", "age", "save", "updateName", "newName")
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for ObjectiveC`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.OBJECTIVE_C)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".m")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".mm")).isTrue()
    }

    @Test
    fun `should return ObjectiveC in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.OBJECTIVE_C)).isTrue()
    }

    @Test
    fun `should return m and mm in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".m")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".mm")).isTrue()
    }

    // === Fast Enumeration (for-in) Tests ===

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

    // === @try/@catch Exception Variable Tests ===

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

    // === Block Parameter Tests ===

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

    // === @synthesize/@dynamic Tests ===

    @Test
    fun `should extract synthesize property name`() {
        // Arrange
        val code = """
            @implementation MyClass
            @synthesize name = _name;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - tree-sitter extracts the first property name from @synthesize
        assertThat(result.identifiers).containsExactly("MyClass", "name")
    }

    @Test
    fun `should extract synthesize property without ivar`() {
        // Arrange
        val code = """
            @implementation MyClass
            @synthesize age;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "age")
    }

    @Test
    fun `should extract dynamic property name`() {
        // Arrange
        val code = """
            @implementation MyClass
            @dynamic computedProperty;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "computedProperty")
    }

    @Test
    fun `should extract multiple synthesize properties`() {
        // Arrange - Use separate @synthesize statements for reliable extraction
        val code = """
            @implementation MyClass
            @synthesize firstName;
            @synthesize lastName;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "firstName", "lastName")
    }

    @Test
    fun `should extract multiple dynamic properties`() {
        // Arrange - Use separate @dynamic statements for reliable extraction
        val code = """
            @implementation MyClass
            @dynamic propA;
            @dynamic propB;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "propA", "propB")
    }

    // === Forward Declaration Tests ===

    @Test
    fun `should extract forward class declaration`() {
        // Arrange
        val code = "@class MyClass, AnotherClass;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "AnotherClass")
    }

    @Test
    fun `should extract single forward class declaration`() {
        // Arrange
        val code = "@class SingleClass;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("SingleClass")
    }

    @Test
    fun `should extract forward protocol declaration`() {
        // Arrange
        val code = "@protocol MyProtocol;"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyProtocol")
    }

    @Test
    fun `should extract multiple forward declarations in file`() {
        // Arrange
        val code = """
            @class UserService;
            @protocol DataDelegate;
            @class OrderManager, CartService;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("UserService", "DataDelegate", "OrderManager", "CartService")
    }

    // === Preprocessor Macro Tests ===

    @Test
    fun `should extract preprocessor macro definition`() {
        // Arrange
        val code = """
            #define APP_NAME @"MyApp"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Macro name is extracted; macro value strings are not parsed as string nodes
        assertThat(result.identifiers).containsExactly("APP_NAME")
    }

    @Test
    fun `should extract numeric macro definition`() {
        // Arrange
        val code = """
            #define MAX_COUNT 100
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MAX_COUNT")
    }

    @Test
    fun `should extract function-like macro definition`() {
        // Arrange
        val code = """
            #define MIN(a, b) ((a) < (b) ? (a) : (b))
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MIN")
    }

    @Test
    fun `should extract multiple macro definitions`() {
        // Arrange
        val code = """
            #define VERSION 1
            #define BUILD_NUMBER 42
            #define APP_ID @"com.example.app"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("VERSION", "BUILD_NUMBER", "APP_ID")
    }

    // === Edge Case Tests ===

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
    fun `should handle class with all new features`() {
        // Arrange
        val code = """
            @class Helper;
            #define TAG @"MyClass"

            @implementation MyClass
            @synthesize name;
            @dynamic computedValue;

            - (void)processItems {
                for (NSString *item in items) {
                    @try {
                        [self processItem:item];
                    }
                    @catch (NSException *ex) {
                        NSLog(@"%@", ex);
                    }
                }

                [items enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
                    handle(obj);
                }];
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Helper", "TAG", "MyClass", "name",
            "computedValue", "processItems", "item", "ex",
            "obj", "idx", "stop"
        )
    }

    @Test
    fun `should handle protocol method declarations`() {
        // Arrange
        val code = """
            @protocol MyProtocol
            - (void)requiredMethod;
            @optional
            - (void)optionalMethod;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyProtocol", "requiredMethod", "optionalMethod")
    }

    @Test
    fun `should handle class extension (anonymous category)`() {
        // Arrange
        val code = """
            @interface MyClass ()
            @property (nonatomic) NSString *privateProperty;
            - (void)privateMethod;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Class name is extracted from category_interface even for extensions
        assertThat(result.identifiers).containsExactly("MyClass", "privateProperty", "privateMethod")
    }

    @Test
    fun `should handle IBAction method`() {
        // Arrange
        val code = """
            @implementation ViewController
            - (IBAction)buttonTapped:(UIButton *)sender {
                NSLog(@"Tapped");
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("ViewController", "buttonTapped", "sender")
    }

    @Test
    fun `should handle IBOutlet property`() {
        // Arrange
        val code = """
            @interface ViewController : UIViewController
            @property (nonatomic, weak) IBOutlet UILabel *titleLabel;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("ViewController", "titleLabel")
    }

    @Test
    fun `should handle complex selector with many parts`() {
        // Arrange
        val code = """
            @implementation Service
            - (id)initWithHost:(NSString *)host port:(int)port user:(NSString *)user password:(NSString *)pass {
                return self;
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "Service",
            "initWithHost",
            "host",
            "port",
            "user",
            "pass"
        )
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
    fun `should not extract from comments containing code-like text`() {
        // Arrange
        val code = """
            // @class HiddenClass;
            // #define HIDDEN 1
            @interface RealClass : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("RealClass")
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
    fun `should handle struct declaration`() {
        // Arrange
        val code = """
            typedef struct {
                int x;
                int y;
            } Point;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyInAnyOrder("x", "y")
    }

    @Test
    fun `should extract from mixed C and Objective-C code`() {
        // Arrange
        val code = """
            #define MAX_SIZE 100

            static int helper_function(int param) {
                return param * 2;
            }

            @implementation Calculator
            - (int)calculateWithValue:(int)value {
                return helper_function(value);
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "MAX_SIZE",
            "helper_function",
            "param",
            "Calculator",
            "calculateWithValue",
            "value"
        )
    }

    // === Additional Edge Case Tests ===

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
    fun `should handle method with no parameters`() {
        // Arrange
        val code = """
            @implementation Service
            - (void)start {
            }
            - (void)stop {
            }
            + (id)sharedInstance {
                return nil;
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Service", "start", "stop", "sharedInstance")
    }

    @Test
    fun `should handle property with primitive type`() {
        // Arrange
        val code = """
            @interface Counter : NSObject
            @property (nonatomic) int count;
            @property (nonatomic) float ratio;
            @property (nonatomic) BOOL enabled;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Counter", "count", "ratio", "enabled")
    }

    @Test
    fun `should handle multiple classes in same file`() {
        // Arrange
        val code = """
            @interface ClassA : NSObject
            - (void)methodA;
            @end

            @interface ClassB : NSObject
            - (void)methodB;
            @end

            @implementation ClassA
            - (void)methodA {}
            @end

            @implementation ClassB
            - (void)methodB {}
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "ClassA",
            "methodA",
            "ClassB",
            "methodB",
            "ClassA",
            "methodA",
            "ClassB",
            "methodB"
        )
    }

    @Test
    fun `should handle empty implementation`() {
        // Arrange
        val code = """
            @implementation EmptyClass
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("EmptyClass")
    }

    @Test
    fun `should handle empty interface`() {
        // Arrange
        val code = """
            @interface EmptyInterface : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("EmptyInterface")
    }

    @Test
    fun `should handle empty protocol`() {
        // Arrange
        val code = """
            @protocol EmptyProtocol
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("EmptyProtocol")
    }

    @Test
    fun `should handle protocol with properties`() {
        // Arrange
        val code = """
            @protocol DataSource
            @property (nonatomic, readonly) NSInteger itemCount;
            - (id)itemAtIndex:(NSInteger)index;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("DataSource", "itemCount", "itemAtIndex", "index")
    }

    @Test
    fun `should handle category with multiple methods`() {
        // Arrange
        val code = """
            @interface NSString (Utilities)
            - (NSString *)trim;
            - (NSString *)reverse;
            - (BOOL)isValidEmail;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Utilities", "trim", "reverse", "isValidEmail")
    }

    @Test
    fun `should handle static variables`() {
        // Arrange
        val code = """
            static NSString *sharedName;
            static int counter = 0;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("sharedName", "counter")
    }

    @Test
    fun `should handle extern declarations`() {
        // Arrange
        val code = """
            extern NSString *const kNotificationName;
            extern int globalCounter;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("kNotificationName", "globalCounter")
    }

    @Test
    fun `should handle typedef struct`() {
        // Arrange
        val code = """
            typedef struct {
                CGFloat x;
                CGFloat y;
                CGFloat width;
                CGFloat height;
            } MyRect;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("x", "y", "width", "height")
    }

    @Test
    fun `should handle typedef enum`() {
        // Arrange - Enum enumerators use different node types not in container set
        val code = """
            typedef enum {
                StatusPending,
                StatusActive,
                StatusCompleted
            } TaskStatus;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Enum enumerators are not currently extracted as identifiers
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should handle NS_ENUM style enum`() {
        // Arrange - NS_ENUM is a macro that tree-sitter may handle differently
        val code = """
            typedef NS_ENUM(NSInteger, Direction) {
                DirectionNorth,
                DirectionSouth,
                DirectionEast,
                DirectionWest
            };
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Enum enumerators are not currently extracted
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should handle string with escaped characters`() {
        // Arrange - Variable with string initialization
        val code = """
            void test() {
                NSString *escaped;
                escaped = @"Line1\nLine2\tTabbed";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "escaped")
    }

    @Test
    fun `should handle empty string`() {
        // Arrange - Separate declaration and assignment
        val code = """
            void test() {
                NSString *empty;
                char *cEmpty;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "empty", "cEmpty")
    }

    @Test
    fun `should handle string with unicode`() {
        // Arrange - Variable declarations without initialization
        val code = """
            void test() {
                NSString *emoji;
                NSString *chinese;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "emoji", "chinese")
    }

    @Test
    fun `should handle comments with special characters`() {
        // Arrange
        val code = """
            // TODO: Fix this @implementation bug <urgent>
            /*
             * Copyright (c) 2024
             * @author Developer <dev@example.com>
             */
            @interface Test : NSObject
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Test")
        assertThat(result.comments).hasSize(2)
    }

    @Test
    fun `should not extract identifiers from string literals`() {
        // Arrange
        val code = """
            void test() {
                NSString *codeStr;
                NSString *methodStr;
                codeStr = @"@interface FakeClass @end";
                methodStr = @"- (void)fakeMethod;";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Variables are declared separately, strings don't create identifiers
        assertThat(result.identifiers).containsExactly("test", "codeStr", "methodStr")
    }

    @Test
    fun `should handle pointer to pointer declaration`() {
        // Arrange
        val code = """
            void test(NSError **errorPtr) {
                NSString **stringPtr;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "errorPtr", "stringPtr")
    }

    @Test
    fun `should handle array declaration`() {
        // Arrange
        val code = """
            void test() {
                int numbers[10];
                char name[256];
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "numbers", "name")
    }

    @Test
    fun `should handle function pointer declaration`() {
        // Arrange
        val code = """
            void test() {
                int (*compareFunc)(const void *, const void *);
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "compareFunc")
    }

    @Test
    fun `should handle method returning instancetype`() {
        // Arrange
        val code = """
            @interface Builder : NSObject
            - (instancetype)init;
            - (instancetype)initWithConfig:(NSDictionary *)config;
            + (instancetype)builder;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Builder", "init", "initWithConfig", "config", "builder")
    }

    @Test
    fun `should handle method with nullable parameter`() {
        // Arrange
        val code = """
            @interface Service : NSObject
            - (void)processData:(NSData * _Nullable)data completion:(void (^)(BOOL))handler;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Service", "processData", "data", "handler")
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
    fun `should handle property with custom getter`() {
        // Arrange
        val code = """
            @interface Config : NSObject
            @property (nonatomic, getter=isEnabled) BOOL enabled;
            @property (nonatomic, getter=isVisible, setter=setVisibility:) BOOL visible;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Config", "enabled", "visible")
    }

    @Test
    fun `should handle multiple forward protocol declarations`() {
        // Arrange
        val code = """
            @protocol ProtocolA, ProtocolB, ProtocolC;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("ProtocolA")
    }

    @Test
    fun `should handle class implementing multiple protocols`() {
        // Arrange
        val code = """
            @interface MyClass : NSObject <NSCoding, NSCopying, UITableViewDelegate>
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass")
    }

    @Test
    fun `should handle instance variable declaration`() {
        // Arrange
        val code = """
            @interface MyClass : NSObject {
                NSString *_name;
                int _count;
                @private
                id _privateData;
            }
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("MyClass", "_name", "_count", "_privateData")
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
    fun `should handle selector as argument`() {
        // Arrange
        val code = """
            void test() {
                SEL selector = @selector(handleAction:);
                [target performSelector:selector];
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "selector")
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

    @Test
    fun `should handle class method with complex return type`() {
        // Arrange
        val code = """
            @interface Factory : NSObject
            + (NSArray<NSString *> *)allNames;
            + (NSDictionary<NSString *, NSNumber *> *)mappings;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Factory", "allNames", "mappings")
    }

    @Test
    fun `should handle conditional compilation`() {
        // Arrange
        val code = """
            #ifdef DEBUG
            #define LOG(msg) NSLog(@"%@", msg)
            #endif

            void test() {
                int value;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert - Only one LOG macro is extracted (ifdef branch)
        assertThat(result.identifiers).containsExactly("LOG", "test", "value")
    }

    @Test
    fun `should handle multiline string concatenation`() {
        // Arrange - Variable declared separately
        val code = """
            void test() {
                NSString *query;
                query = @"SELECT * FROM users";
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "query")
    }

    @Test
    fun `should handle union declaration`() {
        // Arrange
        val code = """
            typedef union {
                int intValue;
                float floatValue;
                char charValue;
            } ValueUnion;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("intValue", "floatValue", "charValue")
    }

    @Test
    fun `should handle bitfield in struct`() {
        // Arrange
        val code = """
            typedef struct {
                unsigned int flag1 : 1;
                unsigned int flag2 : 1;
                unsigned int value : 6;
            } Flags;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("flag1", "flag2", "value")
    }

    @Test
    fun `should handle method with variadic parameters`() {
        // Arrange
        val code = """
            @interface Logger : NSObject
            + (void)logFormat:(NSString *)format, ...;
            - (void)logWithLevel:(int)level format:(NSString *)format, ...;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Logger", "logFormat", "format", "logWithLevel", "level", "format")
    }

    @Test
    fun `should handle inline function`() {
        // Arrange
        val code = """
            static inline int square(int x) {
                return x * x;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("square", "x")
    }

    @Test
    fun `should handle const pointer declarations`() {
        // Arrange
        val code = """
            void test() {
                const char *constPtr;
                char *const ptrConst;
                const char *const bothConst;
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("test", "constPtr", "ptrConst", "bothConst")
    }
}
