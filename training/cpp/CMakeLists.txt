cmake_minimum_required(VERSION 3.16)
project(CellarsAndCentaurs CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE SOURCES "${CMAKE_SOURCE_DIR}/src/*.cpp")
add_library(cellarsandcentaurs ${SOURCES})
target_include_directories(cellarsandcentaurs PUBLIC "${CMAKE_SOURCE_DIR}/src")

file(GLOB_RECURSE TEST_SOURCES "${CMAKE_SOURCE_DIR}/test/*.cpp")
add_executable(cellarsandcentaurs_tests ${TEST_SOURCES})
target_link_libraries(cellarsandcentaurs_tests cellarsandcentaurs gtest_main)
