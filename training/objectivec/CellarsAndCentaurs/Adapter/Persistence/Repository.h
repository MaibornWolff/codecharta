#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface Repository<__covariant ObjectType> : NSObject

- (void)save:(ObjectType)object withIdentifier:(NSString *)identifier;
- (nullable ObjectType)findOne:(NSString *)identifier;
- (NSArray<ObjectType> *)findAll;

@end

NS_ASSUME_NONNULL_END
