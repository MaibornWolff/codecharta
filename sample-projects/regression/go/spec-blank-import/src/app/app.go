package app

import _ "example.com/m/redis"

func Blank() int {
	var redis Conn
	return redis.Dial()
}
