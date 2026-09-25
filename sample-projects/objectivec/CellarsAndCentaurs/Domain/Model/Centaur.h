#import "Creature.h"

NS_ASSUME_NONNULL_BEGIN

@interface Centaur : Creature

@property (nonatomic, assign, readonly) NSUInteger XPValue;

- (BOOL)canCharge;

@end

NS_ASSUME_NONNULL_END
