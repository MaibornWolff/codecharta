#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

NSInteger rollD20(void);

@interface DiceRoll : NSObject

@property (nonatomic, assign, readonly) NSInteger sides;
@property (nonatomic, assign, readonly) NSInteger result;

- (instancetype)initWithSides:(NSInteger)sides result:(NSInteger)result;

@end

@interface Dice : NSObject

@property (nonatomic, assign) NSInteger sides;

- (instancetype)initWithSides:(NSInteger)sides;
- (DiceRoll *)roll;

@end

NS_ASSUME_NONNULL_END
