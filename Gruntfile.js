"use strict";

module.exports = function (grunt) {
	var filesList = [
		"*.js",
		"*.json",
		"tasks/**/*.js",
		"sample/*.js",
		"tests/**/*.js",
		"!**/*_min.js",
		"!tests/app/**/*"
	];

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: filesList,
			options: {
				jshintrc: ".jshintrc"
			}
		},

		lineending: {
			all: {
				options: {
					eol: 'crlf',
					overwrite: true
				},
				files: {
					'': filesList
				}
			}
		},

		jsbeautifier: {
			files: filesList,
			options: {
				config: ".jshintrc",
				js: {
					jslintHappy: true,
					indentWithTabs: true
				}
			}
		},

		intern: {
			local: {
				options: {
					runType: "client",
					config: "tests/local"
				}
			}
		}
	});

	grunt.registerTask("fullTest", function () {
		var done = this.async();

		function npmInstall(error, bowerResults) {
			if (error !== null) {
				grunt.log.writeln(bowerResults.stdout);
				done(error);
				return;
			}
			grunt.util.spawn({
				cmd: "npm",
				args: ["install"],
				opts: {
					cwd: "tests/app/src"
				}
			}, startBuild);
		}

		function startBuild(error, npmResults) {
			if (error !== null) {
				grunt.log.writeln(npmResults.stdout);
				done(error);
				return;
			}

			// replace grunt-amd-build sources with current version
			var dest =  "tests/app/src/node_modules/grunt-amd-build/";
			grunt.file.expandMapping(["tasks/**/*"], dest, {filter: "isFile"}).forEach(function (map) {
				grunt.file.copy(map.src, map.dest, {encoding: null});
			});

			// remove previous output if any
			grunt.file.delete("tests/app/results");
			grunt.util.spawn({
				cmd: "grunt",
				args: ["build"],
				opts: {
					cwd: "tests/app/src"
				}
			}, checkBuild);
		}

		function checkBuild(error, buildResult) {
			var expected = grunt.file.expand({
				filter: "isFile"
			}, ["tests/app/expected/**/*"]).sort();
			var results = grunt.file.expand({
				filter: "isFile"
			}, ["tests/app/results/**/*"]).sort();

			if (error !== null) {
				grunt.log.writeln(buildResult.stdout);
				done(error);
				return;
			}

			var testResult = expected.every(function (value, index) {
				function getFile(path) {
					return grunt.util.normalizelf(grunt.file.read(path));
				}
				var test = (getFile(value) === getFile(results[index]));
				if (!test) {
					grunt.log.writeln(JSON.stringify(expected, null, "\t"));
					grunt.log.writeln(JSON.stringify(results, null, "\t"));
					grunt.log.writeln("");
					grunt.log.writeln(results[index] + " is different of " + value);
				}
				return test;
			});

			done(testResult);
		}

		grunt.util.spawn({
			cmd: "bower",
			args: ["install"],
			opts: {
				cwd: "tests/app/src"
			}
		}, npmInstall);
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks("grunt-lineending");
	grunt.loadNpmTasks("intern");

	// By default, beautify and lint.
	grunt.registerTask("default", ["jsbeautifier", "lineending", "jshint", "intern"]);

};
