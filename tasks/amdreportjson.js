module.exports = function (grunt) {

	"use strict";

	var libDir = "./lib/",
		lang = require(libDir + "lang"),
		normalizeCfg = require(libDir + "normalizeConfig");

	function removeTraillingComa(content) {
		if (content.charAt(content.length - 2) === ",") {
			content = content.slice(0, -2) + content.charAt(content.length - 1);
		}
		return content;
	}

	grunt.registerTask("amdreportjson", function (buildCfg) {
		var config = grunt.config(this.name) || {};
		var buildConfig = normalizeCfg.build(grunt.config(buildCfg));

		var content = "{\n";
		lang.eachProp(buildConfig.layersByName, function (name, layer) {
			content += '\t"' + name + '": {\n';

			if (layer.modules && Object.keys(layer.modules).length > 0) {
				content += '\t\t"modules": {\n';
				Object.keys(layer.modules).sort().forEach(function (module) {
					content += '\t\t\t"' + module + '": true,\n';
				});
				content = removeTraillingComa(content) + '\t\t},\n';
			}

			if (layer.plugins && Object.keys(layer.plugins).length > 0) {
				content += '\t\t"plugins": {\n';
				Object.keys(layer.plugins).sort().forEach(function (plugin) {
					content += '\t\t\t"' + plugin + '": {\n';
					layer.plugins[plugin].sort().forEach(function (resource) {
						content += '\t\t\t\t"' + resource + '": true,\n';
					});
					content = removeTraillingComa(content) + '\t\t\t},\n';
				});
				content = removeTraillingComa(content) + '\t\t},\n';
			}

			if (layer.shim && layer.shim.length > 0) {
				content += '\t\t"shims": [\n';
				layer.shim.forEach(function (value) {
					content += '\t\t\t"' + value.filepath + '",\n';
				});
				content = removeTraillingComa(content) + '\t\t],\n';
			}

			content = removeTraillingComa(content) + '\t},\n';
		});

		content = removeTraillingComa(content) + '}\n';

		var dir = normalizeCfg.normalizeUrl(config.dir || "./");
		grunt.file.write(dir + "buildReport.json", grunt.util.normalizelf(content));
	});
};
