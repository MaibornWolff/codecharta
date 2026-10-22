package util

type Tool struct{}

func (Tool) Helper() {}

func New() Tool { return Tool{} }
