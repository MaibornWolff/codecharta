#import <Foundation/Foundation.h>

#define MAX_HIT_POINTS 999

NS_ASSUME_NONNULL_BEGIN

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
@interface HitPoints : NSObject

@property (nonatomic, assign) NSInteger current;
@property (nonatomic, assign) NSInteger max;
@property (nonatomic, assign) NSInteger temporary;

- (instancetype)initWithCurrent:(NSInteger)current max:(NSInteger)max temporary:(NSInteger)temporary;
+ (instancetype)hitPointsWithMax:(NSInteger)max;
- (void)loseHitPoints:(NSInteger)damage;

@end

NS_ASSUME_NONNULL_END
