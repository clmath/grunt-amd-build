define('mypackage/qux',["./bar"], function (bar) {
	return {
		log: function () {
			bar.log;
			console.log("qux !");
		}
	};
});
;
define('mypackage/bar',{
	log: function () {
		console.log("bar !");
	}
});
;
define('mypackage/foo',["./bar"], function (bar) {
	return {
		log: function () {
			bar.log;
			console.log("foo !");
		}
	};
});
