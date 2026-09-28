#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface Speed : NSObject

@property (nonatomic, assign) NSInteger feetPerRound;

- (instancetype)initWithFeetPerRound:(NSInteger)feetPerRound;
+ (instancetype)speedWithFeetPerRound:(NSInteger)feetPerRound;

@end

NS_ASSUME_NONNULL_END
