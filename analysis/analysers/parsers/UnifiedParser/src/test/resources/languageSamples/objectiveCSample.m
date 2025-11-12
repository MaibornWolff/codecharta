// Objective-C sample file for testing metrics

#import <Foundation/Foundation.h>

/// A simple class demonstrating Objective-C features
@interface Calculator : NSObject

@property (nonatomic, assign) NSInteger result;
@property (nonatomic, assign) NSInteger value;

// Instance methods
- (NSInteger)add:(NSInteger)a with:(NSInteger)b;
- (NSInteger)complexOperation:(NSInteger)x with:(NSInteger)y;
- (NSInteger)guardExample:(NSNumber *)value;
- (NSString *)switchExample:(NSInteger)value;
- (void)loopExamples;
- (NSInteger)nilCheckExample:(NSNumber *)optional;
- (void)blockExample;

// Class methods
+ (NSInteger)classMethodExample:(NSInteger)x;

// Initializer
- (instancetype)init;

@end

@implementation Calculator

// Simple method
- (NSInteger)add:(NSInteger)a with:(NSInteger)b {
    return a + b;
}

// Method with control flow
- (NSInteger)complexOperation:(NSInteger)x with:(NSInteger)y {
    if (x > 0 && y > 0) {
        return x + y;
    } else if (x < 0 || y < 0) {
        return x - y;
    } else {
        return 0;
    }
}

// Guard-like pattern with early return
- (NSInteger)guardExample:(NSNumber *)value {
    if (value == nil) {
        return 0;
    }
    return [value integerValue] * 2;
}

// Switch statement
- (NSString *)switchExample:(NSInteger)value {
    switch (value) {
        case 0:
            return @"zero";
        case 1:
        case 2:
        case 3:
            return @"small";
        case 4:
        case 5:
            return @"medium";
        default:
            return @"large";
    }
}

// Loops
- (void)loopExamples {
    // For loop
    for (int i = 0; i < 10; i++) {
        NSLog(@"%d", i);
    }

    // While loop
    int count = 0;
    while (count < 5) {
        count++;
    }

    // Do-while loop
    do {
        count--;
    } while (count > 0);
}

// Nil check with ternary operator
- (NSInteger)nilCheckExample:(NSNumber *)optional {
    return optional != nil ? [optional integerValue] : 0;
}

// Block (Objective-C closure)
- (void)blockExample {
    // Simple block
    void (^simpleBlock)(NSInteger, NSInteger) = ^(NSInteger x, NSInteger y) {
        NSLog(@"Sum: %ld", (long)(x + y));
    };
    simpleBlock(5, 3);

    // Block with return value
    NSInteger (^addBlock)(NSInteger, NSInteger) = ^NSInteger(NSInteger a, NSInteger b) {
        return a + b;
    };
    NSInteger result = addBlock(10, 20);
    NSLog(@"Result: %ld", (long)result);
}

// Class method
+ (NSInteger)classMethodExample:(NSInteger)x {
    if (x > 0) {
        return x * 2;
    }
    return 0;
}

// Initializer
- (instancetype)init {
    self = [super init];
    if (self) {
        _result = 0;
        _value = 0;
    }
    return self;
}

// Dealloc method
- (void)dealloc {
    NSLog(@"Calculator deallocated");
}

@end

// C function within Objective-C file
NSInteger multipleParams(NSInteger a, NSInteger b, NSInteger c, NSInteger d) {
    return a + b + c + d;
}

// Another C function
int simpleFunction(int x) {
    return x * 2;
}

/*
 * Multi-line comment
 * spanning multiple lines
 * for testing
 */

// Exception handling
@interface ErrorHandler : NSObject
- (void)tryExample;
@end

@implementation ErrorHandler

- (void)tryExample {
    @try {
        NSArray *array = @[@1, @2, @3];
        NSNumber *value = array[10]; // Out of bounds
        NSLog(@"%@", value);
    }
    @catch (NSException *exception) {
        NSLog(@"Exception: %@", exception.name);
    }
    @finally {
        NSLog(@"Cleanup");
    }
}

@end

// Category example
@interface Calculator (ExtendedOperations)
- (NSInteger)multiply:(NSInteger)a with:(NSInteger)b;
@end

@implementation Calculator (ExtendedOperations)

- (NSInteger)multiply:(NSInteger)a with:(NSInteger)b {
    return a * b;
}

@end

// Protocol example
@protocol MathOperations <NSObject>
- (NSInteger)calculate:(NSInteger)value;
@end

// Array enumeration with block
void enumerationExample(void) {
    NSArray *numbers = @[@1, @2, @3, @4, @5];
    [numbers enumerateObjectsUsingBlock:^(NSNumber *obj, NSUInteger idx, BOOL *stop) {
        if ([obj integerValue] > 3) {
            NSLog(@"Found: %@", obj);
            *stop = YES;
        }
    }];
}

// Struct definition
struct Point {
    int x;
    int y;
};

// Function using struct
struct Point createPoint(int x, int y) {
    struct Point p;
    p.x = x;
    p.y = y;
    return p;
}
