# Context

context is king. we need it because AI coding agents have dated memories that are incomplete and not up to date, and they are unaware of this. so every time we use an API or language or anything, we need to ensure we're working with the right interface.

to that end we have a process.

## the process

upon looking for any context, the process is to reference this file ( ./ai/context.md ). you will look for the library name or key word in the first column. if you find it, proceed through the columns to the right of it untill you see a useful entry. if there are none, you need to halt and ask the operator for help looking up the concept. they will direct you from there.

if you find an entry in the "Context7 ID" column, you may immediately call the `context7` mcp tool "get-library-docs" using the entry you found in that column, and it will return the documents. if you find an entry in the "Local Reference Path" column, you may take that as a relative path from the project root to documentation files on the filesystem. you may use your file reading, grepping, listing, etc tools on this path. sometimes it will contain a repomix file, sometimes it will also have the source code and a readme.md.

if you do not find an entry that matches your search term in the left-most column of the table, you should use the `context7` mcp tool "resolve-library-id" to see if an entry exists. whether it exists or not, you should add a row to the table with that search term in the leftmost column. if it exists in context7, add the library-id to the second column. if it did not exist in context7, add that row and halt after informing the operator of the situation.

## the index

| Library Name Searched | Context7 ID | Local Reference Path |
| --------------------- | ----------- | -------------------- |
| @nostr-dev-kit/ndk    |             |                      |
| nostr-tools           |             |                      |
