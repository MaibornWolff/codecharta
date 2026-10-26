#include "pool.hpp"
#include "counter.hpp"

template <class T> int Pool<T>::size() const {
    Counter counter{0};
    return counter.count;
}
