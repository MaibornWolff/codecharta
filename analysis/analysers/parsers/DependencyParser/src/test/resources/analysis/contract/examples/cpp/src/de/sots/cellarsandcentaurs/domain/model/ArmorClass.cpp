#include "ArmorClass.h"
#include "../../application/CreatureUtil.h"

namespace de::sots::cellarsandcentaurs::domain::model {

ArmorClass::ArmorClass(int base, int bonus)
    : ArmorClass(base, bonus, de::sots::cellarsandcentaurs::application::CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION)
{}

ArmorClass::ArmorClass(int base, int bonus, const std::string& description)
    : description_{description}, base_{base}, bonus_{bonus}, total_{base+bonus}
{}

int ArmorClass::getBase() const noexcept { return base_; }
void ArmorClass::setBase(int base) noexcept { base_ = base; total_ = base_ + bonus_; }

int ArmorClass::getBonus() const noexcept { return bonus_; }
void ArmorClass::setBonus(int bonus) noexcept { bonus_ = bonus; total_ = base_ + bonus_; }

int ArmorClass::getTotal() const noexcept { return total_; }
void ArmorClass::setTotal(int total) noexcept { total_ = total; }

const std::string& ArmorClass::getDescription() const noexcept { return description_; }
void ArmorClass::setDescription(const std::string& description) { description_ = description; }

}
