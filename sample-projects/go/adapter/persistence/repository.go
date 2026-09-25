package persistence

type Keyed interface {
	Key() string
}

type Repository[T Keyed] struct {
	rows map[string]T
}

func NewRepository[T Keyed]() Repository[T] {
	return Repository[T]{rows: make(map[string]T)}
}

func (r *Repository[T]) Save(row T) {
	r.rows[row.Key()] = row
}

func (r *Repository[T]) FindOne(key string) (T, bool) {
	row, ok := r.rows[key]
	return row, ok
}

func (r *Repository[T]) FindAll() []T {
	all := make([]T, 0, len(r.rows))
	for _, row := range r.rows {
		all = append(all, row)
	}
	return all
}
