#include "Logger.hpp"

namespace game {
bool log::shouldLog(int category) { Logger logger{}; (void)logger; return category > 0; }
void Logger::flush() { log::Entry entry{0}; (void)entry; }
}
