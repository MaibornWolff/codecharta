package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ObjectiveCDeclarationExtractionTest {
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
    fun `should extract only the parameter of a method whose selector has no name`() {
        // Arrange
        val code = """
            @interface Calculator
            - (void):(int)amount;
            @end
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactly("Calculator", "amount")
    }
}
