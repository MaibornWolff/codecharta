#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface CreatureEntity : NSObject

@property (nonatomic, copy) NSString *identifier;
@property (nonatomic, assign) NSInteger typeCode;

- (instancetype)initWithIdentifier:(nullable NSString *)identifier;

@end

NS_ASSUME_NONNULL_END
