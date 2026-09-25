#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface CreatureId : NSObject <NSCopying>

@property (nonatomic, copy, readonly) NSString *value;

- (instancetype)initWithValue:(NSString *)value NS_DESIGNATED_INITIALIZER;
+ (instancetype)creatureIdWithValue:(NSString *)value;

@end

NS_ASSUME_NONNULL_END
