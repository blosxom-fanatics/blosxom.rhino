#!/usr/bin/env rhino
// vim:ft=javascript:

function p (msg) {
	try {
		print(uneval(msg));
	} catch (e) {
		print(String(msg));
	}
}

importPackage(java.lang);
importPackage(java.io);


BlosxomRhino = function (config) { this.initialize(config) };
BlosxomRhino.prototype = {
	initialize : function (config) {
		this.config = config;
	},

	run : function () {
		var entries = this.getEntries();
		entries.sort(function (a, b) {
			return b.datetime.valueOf() - a.datetime.valueOf();
		});
		p(entries);
	},

	getEntries : function () {
		function _getFiles (dir) {
			var ret = [];
			dir.listFiles().forEach(function (i) {
				if (i.isDirectory()) {
					ret = ret.concat(_getFiles(i));
				} else
				if (i.getName().match(/\.txt$/)) {
					ret.push(i);
				}
			});
			return ret;
		}

		function _readLines(file) {
			var br = new BufferedReader(
				new InputStreamReader(
					new FileInputStream(file),
					"UTF-8"
				)
			);
			var ret = [];
			while (br.ready()) ret.push(br.readLine());
			return ret;
		}

		var self = this;
		var files = _getFiles(File(self.config.data_dir));
		var entries = files.map(function (i) {
			var content = _readLines(i);
			return {
				file     : i,
				name     : String(i).replace(RegExp("^"+self.config.data_dir+"|\\..*$", "g"), ""),
				datetime : new Date(i.lastModified()),
				title    : String(content.shift()),
				body     : content.join("\n"),
			};
		});
		return entries;
	}
};

print("Content-Type: text/plain");
print("");
p(String(System.getenv("USER")));


//var files = File(Config.data_dir).listFiles(
//	FilenameFilter({
//		accept: function (dir, name) {
//			return (name.match(/\.txt$/))
//		}
//	})
//);
//
//p(files);
//
//var entries = files.map(function (i) {
//	p(i.lastModified());
//	p(i.getName());
//	return {
//		file : i,
//		name : String(i).replace(RegExp("^"+Config.data_dir+"|\\..*$", "g"), ""),
//		datetime : new Date(i.lastModified()),
//	};
//});
//p(entries);

new BlosxomRhino({
	data_dir : "data"
}).run();
