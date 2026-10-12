#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
 */
@interface Zentaurenhoehle : NSObject

@property (nonatomic, assign) NSInteger ruestungsklasse;

- (NSString *)beschreibung;

@end

NS_ASSUME_NONNULL_END
