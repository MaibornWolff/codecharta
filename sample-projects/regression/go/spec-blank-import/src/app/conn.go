package app

type Conn struct{}

func (conn Conn) Dial() int { return 1 }
