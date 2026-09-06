#import <Foundation/Foundation.h>

@class Creature;

NS_ASSUME_NONNULL_BEGIN

@interface CreatureClassifier : NSObject

+ (BOOL)isCentaur:(Creature *)creature;
+ (NSString *)kindOf:(Creature *)creature;

@end

NS_ASSUME_NONNULL_END
