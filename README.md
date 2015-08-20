emoji-table
===========

Annotated emoji table built from the online unicode charts.

The charts are sourced from [unicode.org](http://www.unicode.org/emoji/charts/full-emoji-list.html) and so should always be up-to-date.

[See the JSON catalog](dist/emoji.json)

  1. [Usage](#usage)
  2. [Building](#building)
  3. [Changelog](#changelog)
  4. [License](#license)


Usage
-----
Install the emoji package:

	npm install emoji-table

You can then require it in your code:

~~~js
var emoji = require('emoji-table');

console.log(
    emoji.filter(function(e) {
        return e.version >= 7.0;
    })
);
~~~

Each emoji in the list has this structure:

~~~json
{
    "code": "U+1F600",
    "emoji": "😀",
    "name": "grinning face",
    "version": 6.1,
    "tags": [
        "face",
        "grin",
        "person"
    ]
}
~~~

You can also use the catalog directly in [`dist/emoji.json`](dist/emoji.json).


Building
--------
To rebuild the catalog from the online sources:

    git clone https://github.com/zenoamaro/node-emoji.git && cd node-emoji
    make build

You will find an updated catalog file in [`dist/emoji.json`](dist/emoji.json).


Changelog
---------
#### v0.1.0
- Initial version with unicode 8.0 set.


License
-------
The MIT License (MIT)

Copyright (c) 2015, zenoamaro <zenoamaro@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.