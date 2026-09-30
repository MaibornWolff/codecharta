package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ObjectiveCExtractionTest {
    @ParameterizedTest
    @MethodSource("typeDeclarationCases")
    fun `should extract class, category and protocol identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun typeDeclarationCases() = listOf(
        argumentSet(
            "extract class interface identifier",
            """
                @interface User : NSObject
                @end
            """.trimIndent(),
            listOf("User")
        ),
        argumentSet(
            "extract class implementation identifier",
            """
                @implementation Order
                @end
            """.trimIndent(),
            listOf("Order")
        ),
        argumentSet(
            "extract category interface identifier",
            """
                @interface NSString (Validation)
                @end
            """.trimIndent(),
            listOf("Validation")
        ),
        argumentSet(
            "extract category implementation identifier",
            """
                @implementation User (Formatting)
                @end
            """.trimIndent(),
            listOf("Formatting")
        ),
        argumentSet(
            "extract protocol declaration identifier",
            """
                @protocol OrderRepository
                @end
            """.trimIndent(),
            listOf("OrderRepository")
        ),
        argumentSet(
            "handle class extension (anonymous category)",
            """
                @interface MyClass ()
                @property (nonatomic) NSString *privateProperty;
                - (void)privateMethod;
                @end
            """.trimIndent(),
            listOf("MyClass", "privateProperty", "privateMethod")
        ),
        argumentSet(
            "handle multiple classes in same file",
            """
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
            """.trimIndent(),
            listOf("ClassA", "methodA", "ClassB", "methodB", "ClassA", "methodA", "ClassB", "methodB")
        ),
        argumentSet(
            "handle empty implementation",
            """
                @implementation EmptyClass
                @end
            """.trimIndent(),
            listOf("EmptyClass")
        ),
        argumentSet(
            "handle empty interface",
            """
                @interface EmptyInterface : NSObject
                @end
            """.trimIndent(),
            listOf("EmptyInterface")
        ),
        argumentSet(
            "handle empty protocol",
            """
                @protocol EmptyProtocol
                @end
            """.trimIndent(),
            listOf("EmptyProtocol")
        ),
        argumentSet(
            "handle protocol with properties",
            """
                @protocol DataSource
                @property (nonatomic, readonly) NSInteger itemCount;
                - (id)itemAtIndex:(NSInteger)index;
                @end
            """.trimIndent(),
            listOf("DataSource", "itemCount", "itemAtIndex", "index")
        ),
        argumentSet(
            "handle category with multiple methods",
            """
                @interface NSString (Utilities)
                - (NSString *)trim;
                - (NSString *)reverse;
                - (BOOL)isValidEmail;
                @end
            """.trimIndent(),
            listOf("Utilities", "trim", "reverse", "isValidEmail")
        ),
        argumentSet(
            "handle class implementing multiple protocols",
            """
                @interface MyClass : NSObject <NSCoding, NSCopying, UITableViewDelegate>
                @end
            """.trimIndent(),
            listOf("MyClass")
        ),
        argumentSet(
            "handle instance variable declaration",
            """
                @interface MyClass : NSObject {
                    NSString *_name;
                    int _count;
                    @private
                    id _privateData;
                }
                @end
            """.trimIndent(),
            listOf("MyClass", "_name", "_count", "_privateData")
        ),
        argumentSet("extract forward class declaration", "@class MyClass, AnotherClass;", listOf("MyClass", "AnotherClass")),
        argumentSet("extract single forward class declaration", "@class SingleClass;", listOf("SingleClass")),
        argumentSet("extract forward protocol declaration", "@protocol MyProtocol;", listOf("MyProtocol")),
        argumentSet(
            "extract multiple forward declarations in file",
            """
                @class UserService;
                @protocol DataDelegate;
                @class OrderManager, CartService;
            """.trimIndent(),
            listOf("UserService", "DataDelegate", "OrderManager", "CartService")
        ),
        argumentSet("handle multiple forward protocol declarations", "@protocol ProtocolA, ProtocolB, ProtocolC;", listOf("ProtocolA"))
    )

    @ParameterizedTest
    @MethodSource("methodCases")
    fun `should extract method selectors and parameters`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun methodCases() = listOf(
        argumentSet(
            "extract method definition identifier",
            """
                @implementation User
                - (void)save {
                }
                @end
            """.trimIndent(),
            listOf("User", "save")
        ),
        argumentSet(
            "extract method declaration identifier",
            """
                @interface User : NSObject
                - (void)processOrder;
                @end
            """.trimIndent(),
            listOf("User", "processOrder")
        ),
        argumentSet(
            "extract compound method selector first keyword",
            """
                @implementation User
                - (id)initWithName:(NSString *)name age:(int)age {
                    return self;
                }
                @end
            """.trimIndent(),
            listOf("User", "initWithName", "name", "age")
        ),
        argumentSet(
            "extract method parameter identifiers",
            """
                @implementation User
                - (void)setName:(NSString *)customerName age:(int)customerAge {
                }
                @end
            """.trimIndent(),
            listOf("User", "setName", "customerName", "customerAge")
        ),
        argumentSet(
            "extract class method identifier",
            """
                @implementation Factory
                + (id)createOrder {
                    return nil;
                }
                @end
            """.trimIndent(),
            listOf("Factory", "createOrder")
        ),
        argumentSet(
            "handle protocol method declarations",
            """
                @protocol MyProtocol
                - (void)requiredMethod;
                @optional
                - (void)optionalMethod;
                @end
            """.trimIndent(),
            listOf("MyProtocol", "requiredMethod", "optionalMethod")
        ),
        argumentSet(
            "handle IBAction method",
            """
                @implementation ViewController
                - (IBAction)buttonTapped:(UIButton *)sender {
                    NSLog(@"Tapped");
                }
                @end
            """.trimIndent(),
            listOf("ViewController", "buttonTapped", "sender")
        ),
        argumentSet(
            "handle complex selector with many parts",
            """
                @implementation Service
                - (id)initWithHost:(NSString *)host port:(int)port user:(NSString *)user password:(NSString *)pass {
                    return self;
                }
                @end
            """.trimIndent(),
            listOf("Service", "initWithHost", "host", "port", "user", "pass")
        ),
        argumentSet(
            "handle method with no parameters",
            """
                @implementation Service
                - (void)start {
                }
                - (void)stop {
                }
                + (id)sharedInstance {
                    return nil;
                }
                @end
            """.trimIndent(),
            listOf("Service", "start", "stop", "sharedInstance")
        ),
        argumentSet(
            "handle method returning instancetype",
            """
                @interface Builder : NSObject
                - (instancetype)init;
                - (instancetype)initWithConfig:(NSDictionary *)config;
                + (instancetype)builder;
                @end
            """.trimIndent(),
            listOf("Builder", "init", "initWithConfig", "config", "builder")
        ),
        argumentSet(
            "handle method with nullable parameter",
            """
                @interface Service : NSObject
                - (void)processData:(NSData * _Nullable)data completion:(void (^)(BOOL))handler;
                @end
            """.trimIndent(),
            listOf("Service", "processData", "data", "handler")
        ),
        argumentSet(
            "handle class method with complex return type",
            """
                @interface Factory : NSObject
                + (NSArray<NSString *> *)allNames;
                + (NSDictionary<NSString *, NSNumber *> *)mappings;
                @end
            """.trimIndent(),
            listOf("Factory", "allNames", "mappings")
        ),
        argumentSet(
            "handle method with variadic parameters",
            """
                @interface Logger : NSObject
                + (void)logFormat:(NSString *)format, ...;
                - (void)logWithLevel:(int)level format:(NSString *)format, ...;
                @end
            """.trimIndent(),
            listOf("Logger", "logFormat", "format", "logWithLevel", "level", "format")
        ),
        argumentSet(
            "handle selector as argument",
            """
                void test() {
                    SEL selector = @selector(handleAction:);
                    [target performSelector:selector];
                }
            """.trimIndent(),
            listOf("test", "selector")
        )
    )

    @ParameterizedTest
    @MethodSource("propertyCases")
    fun `should extract property names`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun propertyCases() = listOf(
        argumentSet(
            "extract property declaration identifier",
            """
                @interface User : NSObject
                @property (nonatomic, strong) NSString *userName;
                @end
            """.trimIndent(),
            listOf("User", "userName")
        ),
        argumentSet(
            "extract property declaration with readonly attribute",
            """
                @interface Order : NSObject
                @property (nonatomic, readonly) NSString *orderId;
                @end
            """.trimIndent(),
            listOf("Order", "orderId")
        ),
        argumentSet(
            "handle IBOutlet property",
            """
                @interface ViewController : UIViewController
                @property (nonatomic, weak) IBOutlet UILabel *titleLabel;
                @end
            """.trimIndent(),
            listOf("ViewController", "titleLabel")
        ),
        argumentSet(
            "handle property with primitive type",
            """
                @interface Counter : NSObject
                @property (nonatomic) int count;
                @property (nonatomic) float ratio;
                @property (nonatomic) BOOL enabled;
                @end
            """.trimIndent(),
            listOf("Counter", "count", "ratio", "enabled")
        ),
        argumentSet(
            "handle property with custom getter",
            """
                @interface Config : NSObject
                @property (nonatomic, getter=isEnabled) BOOL enabled;
                @property (nonatomic, getter=isVisible, setter=setVisibility:) BOOL visible;
                @end
            """.trimIndent(),
            listOf("Config", "enabled", "visible")
        ),
        argumentSet(
            "extract synthesize property name",
            """
                @implementation MyClass
                @synthesize name = _name;
                @end
            """.trimIndent(),
            listOf("MyClass", "name")
        ),
        argumentSet(
            "extract synthesize property without ivar",
            """
                @implementation MyClass
                @synthesize age;
                @end
            """.trimIndent(),
            listOf("MyClass", "age")
        ),
        argumentSet(
            "extract dynamic property name",
            """
                @implementation MyClass
                @dynamic computedProperty;
                @end
            """.trimIndent(),
            listOf("MyClass", "computedProperty")
        ),
        argumentSet(
            "extract multiple synthesize properties",
            """
                @implementation MyClass
                @synthesize firstName;
                @synthesize lastName;
                @end
            """.trimIndent(),
            listOf("MyClass", "firstName", "lastName")
        ),
        argumentSet(
            "extract multiple dynamic properties",
            """
                @implementation MyClass
                @dynamic propA;
                @dynamic propB;
                @end
            """.trimIndent(),
            listOf("MyClass", "propA", "propB")
        )
    )

    @ParameterizedTest
    @MethodSource("cDeclarationCases")
    fun `should extract C function, variable and type identifiers`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun cDeclarationCases() = listOf(
        argumentSet(
            "extract C function identifier",
            """
                void process_order(int orderId) {
                }
            """.trimIndent(),
            listOf("process_order", "orderId")
        ),
        argumentSet("extract variable declaration identifier", "int orderCount;", listOf("orderCount")),
        argumentSet("extract initialized variable declaration identifier", "int orderCount = 10;", listOf("orderCount")),
        argumentSet("extract pointer variable declaration identifier", "NSString *customerName;", listOf("customerName")),
        argumentSet(
            "handle static variables",
            """
                static NSString *sharedName;
                static int counter = 0;
            """.trimIndent(),
            listOf("sharedName", "counter")
        ),
        argumentSet(
            "handle extern declarations",
            """
                extern NSString *const kNotificationName;
                extern int globalCounter;
            """.trimIndent(),
            listOf("kNotificationName", "globalCounter")
        ),
        argumentSet(
            "handle typedef struct",
            """
                typedef struct {
                    CGFloat x;
                    CGFloat y;
                    CGFloat width;
                    CGFloat height;
                } MyRect;
            """.trimIndent(),
            listOf("x", "y", "width", "height")
        ),
        argumentSet(
            "handle typedef enum",
            """
                typedef enum {
                    StatusPending,
                    StatusActive,
                    StatusCompleted
                } TaskStatus;
            """.trimIndent(),
            emptyList<String>()
        ),
        argumentSet(
            "handle NS_ENUM style enum",
            """
                typedef NS_ENUM(NSInteger, Direction) {
                    DirectionNorth,
                    DirectionSouth,
                    DirectionEast,
                    DirectionWest
                };
            """.trimIndent(),
            emptyList<String>()
        ),
        argumentSet(
            "handle pointer to pointer declaration",
            """
                void test(NSError **errorPtr) {
                    NSString **stringPtr;
                }
            """.trimIndent(),
            listOf("test", "errorPtr", "stringPtr")
        ),
        argumentSet(
            "handle array declaration",
            """
                void test() {
                    int numbers[10];
                    char name[256];
                }
            """.trimIndent(),
            listOf("test", "numbers", "name")
        ),
        argumentSet(
            "handle function pointer declaration",
            """
                void test() {
                    int (*compareFunc)(const void *, const void *);
                }
            """.trimIndent(),
            listOf("test", "compareFunc")
        ),
        argumentSet(
            "handle union declaration",
            """
                typedef union {
                    int intValue;
                    float floatValue;
                    char charValue;
                } ValueUnion;
            """.trimIndent(),
            listOf("intValue", "floatValue", "charValue")
        ),
        argumentSet(
            "handle bitfield in struct",
            """
                typedef struct {
                    unsigned int flag1 : 1;
                    unsigned int flag2 : 1;
                    unsigned int value : 6;
                } Flags;
            """.trimIndent(),
            listOf("flag1", "flag2", "value")
        ),
        argumentSet(
            "handle inline function",
            """
                static inline int square(int x) {
                    return x * x;
                }
            """.trimIndent(),
            listOf("square", "x")
        ),
        argumentSet(
            "handle const pointer declarations",
            """
                void test() {
                    const char *constPtr;
                    char *const ptrConst;
                    const char *const bothConst;
                }
            """.trimIndent(),
            listOf("test", "constPtr", "ptrConst", "bothConst")
        ),
        argumentSet(
            "handle variable assigned an escaped string",
            """
                void test() {
                    NSString *escaped;
                    escaped = @"Line1\nLine2\tTabbed";
                }
            """.trimIndent(),
            listOf("test", "escaped")
        ),
        argumentSet(
            "handle empty string variables",
            """
                void test() {
                    NSString *empty;
                    char *cEmpty;
                }
            """.trimIndent(),
            listOf("test", "empty", "cEmpty")
        ),
        argumentSet(
            "handle unicode string variables",
            """
                void test() {
                    NSString *emoji;
                    NSString *chinese;
                }
            """.trimIndent(),
            listOf("test", "emoji", "chinese")
        ),
        argumentSet(
            "handle variable assigned a query string",
            """
                void test() {
                    NSString *query;
                    query = @"SELECT * FROM users";
                }
            """.trimIndent(),
            listOf("test", "query")
        )
    )

    @ParameterizedTest
    @MethodSource("preprocessorCases")
    fun `should extract preprocessor macro names`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun preprocessorCases() = listOf(
        argumentSet("extract preprocessor macro definition", """#define APP_NAME @"MyApp"""", listOf("APP_NAME")),
        argumentSet("extract numeric macro definition", "#define MAX_COUNT 100", listOf("MAX_COUNT")),
        argumentSet("extract function-like macro definition", "#define MIN(a, b) ((a) < (b) ? (a) : (b))", listOf("MIN")),
        argumentSet(
            "extract multiple macro definitions",
            """
                #define VERSION 1
                #define BUILD_NUMBER 42
                #define APP_ID @"com.example.app"
            """.trimIndent(),
            listOf("VERSION", "BUILD_NUMBER", "APP_ID")
        ),
        argumentSet(
            "handle conditional compilation",
            """
                #ifdef DEBUG
                #define LOG(msg) NSLog(@"%@", msg)
                #endif

                void test() {
                    int value;
                }
            """.trimIndent(),
            listOf("LOG", "test", "value")
        )
    )

    @ParameterizedTest
    @MethodSource("loopAndExceptionVariableCases")
    fun `should extract for-in and catch variables`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun loopAndExceptionVariableCases() = listOf(
        argumentSet(
            "extract fast enumeration variable with pointer type",
            """
                void test() {
                    for (NSString *item in array) {
                        NSLog(@"%@", item);
                    }
                }
            """.trimIndent(),
            listOf("test", "item")
        ),
        argumentSet(
            "extract fast enumeration variable with id type",
            """
                void test() {
                    for (id key in dictionary) {
                        NSLog(@"%@", key);
                    }
                }
            """.trimIndent(),
            listOf("test", "key")
        ),
        argumentSet(
            "extract fast enumeration with explicit type",
            """
                void test() {
                    for (NSDictionary *dict in dictionaries) {
                        process(dict);
                    }
                }
            """.trimIndent(),
            listOf("test", "dict")
        ),
        argumentSet(
            "handle multiple for-in loops",
            """
                void test() {
                    for (NSString *key in keys) {
                        process(key);
                    }
                    for (id value in values) {
                        process(value);
                    }
                }
            """.trimIndent(),
            listOf("test", "key", "value")
        ),
        argumentSet(
            "handle nested for-in loops",
            """
                void test() {
                    for (NSArray *innerArray in outerArray) {
                        for (NSString *item in innerArray) {
                            process(item);
                        }
                    }
                }
            """.trimIndent(),
            listOf("test", "innerArray", "item")
        ),
        argumentSet(
            "handle for-in with dictionary",
            """
                void test() {
                    NSDictionary *dict;
                    for (NSString *key in dict) {
                        id value = dict[key];
                        process(key, value);
                    }
                }
            """.trimIndent(),
            listOf("test", "dict", "key", "value")
        ),
        argumentSet(
            "extract catch exception variable",
            """
                void test() {
                    @try {
                        [self riskyOperation];
                    }
                    @catch (NSException *exception) {
                        NSLog(@"Exception: %@", exception);
                    }
                }
            """.trimIndent(),
            listOf("test", "exception")
        ),
        argumentSet(
            "extract catch with different exception type",
            """
                void test() {
                    @try {
                        riskyOperation();
                    }
                    @catch (NSError *error) {
                        handleError(error);
                    }
                }
            """.trimIndent(),
            listOf("test", "error")
        ),
        argumentSet(
            "extract multiple catch clauses",
            """
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
            """.trimIndent(),
            listOf("test", "argEx", "ex")
        ),
        argumentSet(
            "extract try-catch-finally variables",
            """
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
            """.trimIndent(),
            listOf("test", "exception")
        ),
        argumentSet(
            "handle nested try-catch blocks",
            """
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
            """.trimIndent(),
            listOf("test", "innerEx", "outerEx")
        ),
        argumentSet(
            "handle try with only finally no catch",
            """
                void test() {
                    @try {
                        riskyOperation();
                    }
                    @finally {
                        cleanup();
                    }
                }
            """.trimIndent(),
            listOf("test")
        )
    )

    @ParameterizedTest
    @MethodSource("blockCases")
    fun `should extract block parameters`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun blockCases() = listOf(
        argumentSet(
            "extract block parameters from block literal",
            """
                void test() {
                    void (^myBlock)(NSString *, int) = ^(NSString *name, int count) {
                        NSLog(@"%@", name);
                    };
                }
            """.trimIndent(),
            listOf("test", "name", "count")
        ),
        argumentSet(
            "extract enumeration block parameters",
            """
                void test() {
                    [array enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
                        NSLog(@"%@", obj);
                    }];
                }
            """.trimIndent(),
            listOf("test", "obj", "idx", "stop")
        ),
        argumentSet(
            "extract block with single parameter",
            """
                void test() {
                    void (^handler)(NSString *) = ^(NSString *message) {
                        NSLog(@"%@", message);
                    };
                }
            """.trimIndent(),
            listOf("test", "message")
        ),
        argumentSet(
            "extract completion handler block parameters",
            """
                void test() {
                    [network fetchDataWithCompletion:^(NSData *data, NSError *error) {
                        if (error) {
                            handleError(error);
                        }
                    }];
                }
            """.trimIndent(),
            listOf("test", "data", "error")
        ),
        argumentSet(
            "handle nested blocks",
            """
                void test() {
                    dispatch_async(queue, ^{
                        [array enumerateObjectsUsingBlock:^(id innerObj, NSUInteger innerIdx, BOOL *innerStop) {
                            process(innerObj);
                        }];
                    });
                }
            """.trimIndent(),
            listOf("test", "innerObj", "innerIdx", "innerStop")
        ),
        argumentSet(
            "handle block with no parameters",
            """
                void test() {
                    dispatch_async(queue, ^{
                        doSomething();
                    });
                }
            """.trimIndent(),
            listOf("test")
        ),
        argumentSet(
            "handle multiple blocks in same method",
            """
                void test() {
                    dispatch_async(queue1, ^(void) {
                        firstTask();
                    });
                    dispatch_async(queue2, ^(void) {
                        secondTask();
                    });
                }
            """.trimIndent(),
            listOf("test")
        ),
        argumentSet(
            "handle block with return type",
            """
                void test() {
                    NSInteger (^sum)(NSInteger, NSInteger) = ^NSInteger(NSInteger a, NSInteger b) {
                        return a + b;
                    };
                }
            """.trimIndent(),
            listOf("test", "a", "b")
        ),
        argumentSet(
            "handle deeply nested blocks",
            """
                void test() {
                    dispatch_async(queue, ^{
                        [service fetchWithCompletion:^(NSData *data) {
                            [parser parseData:data completion:^(id result) {
                                handleResult(result);
                            }];
                        }];
                    });
                }
            """.trimIndent(),
            listOf("test", "data", "result")
        ),
        argumentSet(
            "handle dispatch_once pattern",
            """
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
            """.trimIndent(),
            listOf("Singleton", "sharedInstance", "instance", "onceToken")
        )
    )

    @ParameterizedTest
    @MethodSource("completeSourceCases")
    fun `should extract identifiers from complete source files`(code: String, expectedIdentifiers: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.identifiers).containsExactlyElementsOf(expectedIdentifiers)
    }

    fun completeSourceCases() = listOf(
        argumentSet(
            "extract from complete class",
            """
                @interface Customer : NSObject
                @property (nonatomic, strong) NSString *name;
                @property (nonatomic, assign) int age;
                - (void)save;
                - (void)updateName:(NSString *)newName;
                @end
            """.trimIndent(),
            listOf("Customer", "name", "age", "save", "updateName", "newName")
        ),
        argumentSet(
            "handle class with all new features",
            """
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
            """.trimIndent(),
            listOf("Helper", "TAG", "MyClass", "name", "computedValue", "processItems", "item", "ex", "obj", "idx", "stop")
        ),
        argumentSet(
            "extract from mixed C and Objective-C code",
            """
                #define MAX_SIZE 100

                static int helper_function(int param) {
                    return param * 2;
                }

                @implementation Calculator
                - (int)calculateWithValue:(int)value {
                    return helper_function(value);
                }
                @end
            """.trimIndent(),
            listOf("MAX_SIZE", "helper_function", "param", "Calculator", "calculateWithValue", "value")
        ),
        argumentSet(
            "not extract from comments containing code-like text",
            """
                // @class HiddenClass;
                // #define HIDDEN 1
                @interface RealClass : NSObject
                @end
            """.trimIndent(),
            listOf("RealClass")
        ),
        argumentSet(
            "not extract identifiers from string literals",
            """
                void test() {
                    NSString *codeStr;
                    NSString *methodStr;
                    codeStr = @"@interface FakeClass @end";
                    methodStr = @"- (void)fakeMethod;";
                }
            """.trimIndent(),
            listOf("test", "codeStr", "methodStr")
        ),
        argumentSet(
            "handle at-autoreleasepool",
            """
                void test() {
                    NSString *str;
                    @autoreleasepool {
                        str = [[NSString alloc] init];
                        process(str);
                    }
                }
            """.trimIndent(),
            listOf("test", "str")
        ),
        argumentSet(
            "handle at-synchronized",
            """
                void test() {
                    @synchronized(self) {
                        int localVar = sharedCounter;
                        sharedCounter = localVar + 1;
                    }
                }
            """.trimIndent(),
            listOf("test", "localVar")
        )
    )

    @ParameterizedTest
    @MethodSource("commentCases")
    fun `should extract comment text`(code: String, expectedComment: String) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.comments).containsExactly(expectedComment)
    }

    fun commentCases() = listOf(
        argumentSet(
            "extract single line comment",
            """
                // This is a comment
                @interface User : NSObject
                @end
            """.trimIndent(),
            "This is a comment"
        ),
        argumentSet(
            "extract block comment",
            """
                /* This is a block comment */
                @interface User : NSObject
                @end
            """.trimIndent(),
            "This is a block comment"
        ),
        argumentSet(
            "extract multiline block comment",
            """
                /*
                 * This is a multiline
                 * block comment
                 */
                @interface User : NSObject
                @end
            """.trimIndent(),
            "This is a multiline\nblock comment"
        ),
        argumentSet(
            "extract doc comment",
            """
                /**
                 * Process the given order.
                 * @param order The order to process
                 */
                @interface OrderProcessor : NSObject
                @end
            """.trimIndent(),
            "Process the given order.\n@param order The order to process"
        )
    )

    @ParameterizedTest
    @MethodSource("stringCases")
    fun `should extract C and NSString literals`(code: String, expectedStrings: List<String>) {
        // Act
        val result = TreeSitterExtraction.extract(code, Language.OBJECTIVE_C)

        // Assert
        assertThat(result.strings).containsExactlyElementsOf(expectedStrings)
    }

    fun stringCases() = listOf(
        argumentSet(
            "extract C string literal",
            """
                void test() {
                    char *message = "Hello World";
                }
            """.trimIndent(),
            listOf("Hello World")
        ),
        argumentSet(
            "extract NSString literal",
            """
                void test() {
                    NSString *message = @"Hello World";
                }
            """.trimIndent(),
            listOf("Hello World")
        ),
        argumentSet(
            "extract multiple strings",
            """
                void test() {
                    NSString *first = @"Hello";
                    NSString *second = @"World";
                }
            """.trimIndent(),
            listOf("Hello", "World")
        )
    )

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
}
