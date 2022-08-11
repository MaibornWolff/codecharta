## More perfomant alternativ for insertion algorithm

### Abstract

In `getFilenamesWithHighestMetric.ts` , we implemented the function `updateAttributeMap` which adds items to a `Map<string,FileToValue[]>` . This file shows how the perfomance can be improved.

### Alternative Algorithm

Instead of using the slightly costly

```
...
insertSorted(previousValues, newPair)
map.set(key, previousValues.slice(0, MAX_ENTRIES))
...
```

we could go for the following algorithm (pseudo-code):

```
IF ( previousValues.length < MAX_ENTRIES ) :
        insertSorted( previousValues, newPair )
ELSE
        insertInFullDescendingList( previousValues, newPair )
```

whereby `insertInFullDescendingList` could be implemented as

```
function insertInFullDescendingList<T extends { value: number }>(newItem: T, descendingList: T[]): void {
	let index = descendingList.length - 1
	while (index >= 0) {
		const oldItem = descendingList[index]

		if (oldItem.value < newItem.value) {
			const afterFirstLoop = index < descendingList.length - 1
			if (afterFirstLoop) {
				descendingList[index + 1] = oldItem
			}

			const atLastLoop = index === 0
			if (atLastLoop) {
				descendingList[index] = newItem
			}
		} else {
			const newValueTooSmall = index === descendingList.length - 1
			if (!newValueTooSmall) {
				descendingList[index + 1] = newItem
			}

			break
		}
		index--
	}
}
```

The perfomance would improve because we loop ONCE through the list and we IMMEDIATELY stop the iteration after `newItem` has found it's place. Also, we do not add `newItem` at all and we immediately stop the iteration, if the lowest value in the list is already bigger than `newItem.value` .
