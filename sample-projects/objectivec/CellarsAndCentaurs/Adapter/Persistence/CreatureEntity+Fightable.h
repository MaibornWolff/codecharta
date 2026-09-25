#import "CreatureEntity.h"

NS_ASSUME_NONNULL_BEGIN

@interface CreatureEntity (Fightable) <Fightable>

@property (nonatomic, assign) NSInteger storedHitPoints;

@end

NS_ASSUME_NONNULL_END
