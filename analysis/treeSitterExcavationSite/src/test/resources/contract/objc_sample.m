/**
 * A comprehensive sample file demonstrating various Objective-C features.
 * Used for golden file contract testing.
 */

#import <Foundation/Foundation.h>

// Protocol for testing
@protocol Processable <NSObject>
- (NSString *)process;
@end

// Status enum
typedef NS_ENUM(NSInteger, Status) {
    StatusPending,
    StatusActive,
    StatusCompleted
};

// Class-level constant
static const NSInteger MAX_RETRIES = 3;

@interface Sample : NSObject <Processable>

@property (nonatomic, readonly) NSString *prefix;
@property (nonatomic, assign) NSInteger counter;

- (instancetype)initWithPrefix:(NSString *)prefix;
- (NSInteger)getCounter;
- (NSInteger)calculateWithA:(NSInteger)a b:(NSInteger)b c:(NSInteger)c d:(NSInteger)d e:(NSInteger)e;
- (NSString *)processData:(NSArray<NSString *> *)items;
- (NSString *)chainedCall:(NSString *)input;
- (NSString *)formatByType:(NSInteger)type;

@end

@implementation Sample

/// Simple initializer
- (instancetype)initWithPrefix:(NSString *)prefix {
    self = [super init];
    if (self) {
        _prefix = prefix ?: @"Hello, ";
        _counter = 0;
    }
    return self;
}

/* Simple getter with no complexity */
- (NSInteger)getCounter {
    return _counter;
}

// Calculate sum with validation and control flow
- (NSInteger)calculateWithA:(NSInteger)a b:(NSInteger)b c:(NSInteger)c d:(NSInteger)d e:(NSInteger)e {
    if (a < 0 || b < 0) {
        return 0;
    }
    NSInteger sum = 0;
    for (NSInteger i = 0; i < c; i++) {
        sum += a + b;
    }
    NSInteger remaining = d;
    while (remaining > 0) {
        sum += remaining;
        remaining--;
    }
    return sum + e;
}

/*
 * A long method that processes data with nested logic.
 * This tests long_method detection (15+ lines).
 */
- (NSString *)processData:(NSArray<NSString *> *)items {
    NSMutableString *result = [NSMutableString string];
    NSInteger count = 0;
    for (NSString *item in items) {
        if (item == nil) {
            continue;
        }
        if (item.length == 0) {
            [result appendString:@"empty"];
        } else if (item.length > 10) {
            for (NSInteger i = 0; i < 3; i++) {
                [result appendString:[item substringToIndex:5]];
            }
        } else {
            [result appendString:item];
        }
        count++;
    }
    @try {
        [result appendFormat:@" total: %ld", (long)count];
    } @catch (NSException *exception) {
        return @"error";
    }
    return result;
}

// Method chaining example (triggers message_chains metric)
- (NSString *)chainedCall:(NSString *)input {
    if (input == nil) {
        return nil;
    }
    return [[[[input stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]]
              uppercaseString]
             stringByReplacingOccurrencesOfString:@"A" withString:@"X"]
            stringByReplacingOccurrencesOfString:@"B" withString:@"Y"];
}

/**
 * Demonstrates switch expression usage.
 * @param type the type identifier
 * @return formatted result string
 */
- (NSString *)formatByType:(NSInteger)type {
    NSString *label;
    switch (type) {
        case 1:
            label = @"one";
            break;
        case 2:
            label = @"two";
            break;
        case 3:
            label = @"three";
            break;
        default:
            label = @"unknown";
    }
    return [_prefix stringByAppendingString:label];
}

// Block example
- (NSInteger)transformValue:(NSInteger)value usingBlock:(NSInteger (^)(NSInteger))block {
    return block(value);
}

// Protocol implementation
- (NSString *)process {
    return @"processed";
}

@end
