/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
import fetch     from "isomorphic-fetch";
import fetchPlus from "fetch-plus/src";

// Middlewares
import plusBasicAuth  from "fetch-plus-basicauth/src";
import plusBearerAuth from "fetch-plus-bearerauth/src";
import plusCsrf       from "fetch-plus-csrf/src";
import Immutable      from "immutable";
import plusImmutable  from "fetch-plus-immutable/src";
import plusJson       from "fetch-plus-json/src";
import plusOAuth      from "fetch-plus-oauth/src";
import plusUserAgent  from "fetch-plus-useragent/src";
import plusXml        from "fetch-plus-xml/src";
import plusStream     from "fetch-plus-stream/src";

async function main () {
	// Drop-in replacement for Fetch API.
	fetchPlus.fetch("http://jsonplaceholder.typicode.com/posts", {query: "_limit=2"}, [plusJson()]).then(renderJSON);

	// Or create REST endpoint.
	const api = fetchPlus.connectEndpoint("http://jsonplaceholder.typicode.com");

	// Add User-Agent header constructed with a key-value map.
	api.addMiddleware(plusUserAgent({"fetch-plus": "1.0.0"}));

	// Add CSRF token that automatically refreshes.
	api.addMiddleware(plusCsrf("X-Csrf-Token", "csrf_token"));

	// Add Basic Auth username and password.
	api.addMiddleware(plusBasicAuth("hello", "world"));

	// Add Fetch API Stream subscriber.
	api.addMiddleware(plusStream({
		content: "",
		next (chunk) {
			this.content += "" + String.fromCharCode.apply(null, chunk.value);
		},
		complete (chunk) {
			return {
				ok: true,
				json: () => JSON.parse(this.content)
			};
		},
		error (error) {
			console.warn(error);
		}
	}));

	// Add JSON headers and response transformer.
	api.addMiddleware(plusJson());

	// Add Immutable reviver.
	api.addMiddleware(plusImmutable((key, value, request, response) => {
		if (Immutable.Iterable.isIndexed(value)) {
			return value.toList();
		}

		if (request.path.match(/(^|\/)posts(\/.+)?$/)) {
			return new (Immutable.Record({userId: 0, id: 0, title: "", body: ""}))(value);
		}

		if (request.path.match(/(^|\/)comments(\/.+)$/)) {
			return new (Immutable.Record({postId: 0, id: 0, name: "", email: "", body: ""}))(value);
		}

		return value;
	}));

	// Add custom error handler that prints and rethrows any error.
	api.addMiddleware((request) => ({error: (e) => {console.warn("Rethrowing: ", e&&e.stack||e); throw e;}}));

	// Perform some BREAD requests.
	await api.browse("posts", {query:{_limit: 1}}).then(renderJSON);
	await api.browse("comments", {query:{_limit: 2, postId: 2}}).then(renderJSON);
	await api.read(["posts", 3]).then(renderJSON);
	await api.edit(["posts", 4], {body: "[]"}).then(renderJSON);
	await api.add("posts", {query:{postId: 5}, body: "[]"}).then(renderJSON);
	await api.replace(["posts", 6], {body: "[]"}).then(renderJSON);
	await api.destroy(["posts", 7]).then(renderJSON);
	await api.browse(["posts", 8, "comments"]).then(renderJSON);
	await api.browse(["posts", 9, "comments", 9]).catch((e) => console.warn(e)); // warning cannot "browse" single record
	await api.read(["posts", 10, "comments", 10], {query:{_limit: 1}}).catch((e) => console.error(e.status)); // 404
}

main();

function renderJSON (response) {
	console.log("Rendered response to screen");

	const root            = document.getElementById("react-root");
	root.style.fontFamily = "monospace";
	root.innerHTML += "" + JSON.stringify(response) + "<br/><br />";
}
