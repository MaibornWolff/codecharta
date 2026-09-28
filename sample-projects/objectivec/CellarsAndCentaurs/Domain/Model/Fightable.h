#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol Fightable <NSObject>

- (NSInteger)rollInitiative;
- (void)takeDamage:(NSInteger)damage;

@end

NS_ASSUME_NONNULL_END
