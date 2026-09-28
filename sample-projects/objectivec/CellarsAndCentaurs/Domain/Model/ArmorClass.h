#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ArmorClass : NSObject

@property (nonatomic, copy) NSString *armorDescription;
@property (nonatomic, assign) NSInteger base;
@property (nonatomic, assign) NSInteger bonus;
@property (nonatomic, assign, readonly) NSInteger total;

- (instancetype)initWithBase:(NSInteger)base bonus:(NSInteger)bonus;
- (instancetype)initWithBase:(NSInteger)base bonus:(NSInteger)bonus description:(NSString *)armorDescription;
- (BOOL)isWithinLimits;

@end

NS_ASSUME_NONNULL_END
