cmake_minimum_required(VERSION 3.10)
project(MyApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE SRC_FILES "${CMAKE_SOURCE_DIR}/src/*.cpp" "${CMAKE_SOURCE_DIR}/src/*.h")
if(SRC_FILES)
    add_executable(MyApp ${SRC_FILES}
            src/main.cpp)
else()
    message(FATAL_ERROR "No source files found in ${CMAKE_SOURCE_DIR}/src. Check your file names and paths!")
endif()
