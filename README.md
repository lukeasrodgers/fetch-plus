# fetch-rest

Generic REST API client using [Fetch API](https://github.com/whatwg/fetch).

## Features

- Uses the standard Fetch API.
- Builder-interface to configure the generic REST API client as you need.
- Runs in Node and browsers. (BYO Fetch API and Promises polyfills though)

## Installation

```bash
	npm install --save fetch-rest
```

## Usage

````js
import {describeEndpoint} from "fetch-rest";

// One-liner (recommended)
describeEndpoint("http://jsonplaceholder.typicode.com", fetchApiOptions).describeResource("comments", moreFetchApiOptions).browse({postId: 12}, overrideFetchApiOptions).then(response => response.json()).then(json => console.log(json));


import {describeEndpoint, describeResource, browse} from "fetch-rest";

// Three-liner (functional)
const endpoint = describeEndpoint("http://jsonplaceholder.typicode.com", fetchApiOptions);
const comments = describeResource(endpoint, "comments", moreFetchApiOptions);
browse(comments, {postId: 12}, overrideFetchApiOptions).then(response => response.json()).then(json => console.log(json));

````

## Community

Let's start one together! After you ★Star this project, follow me [@Rygu](https://twitter.com/rygu)
on Twitter.

## License

BSD 3-Clause license. Copyright © 2015, Rick Wong. All rights reserved.