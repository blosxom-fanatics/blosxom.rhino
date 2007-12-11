#!rhino

function p (msg) {
	try {
		print(uneval(msg));
	} catch (e) {
		print(String(msg));
	}
}

importPackage(java.lang);
importPackage(java.io);

load("ejs.js");

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

		var path_info = this.getenv("PATH_INFO") || "/";
		if (path_info.match(RegExp("^/(\\d{4})(?:/(\\d\\d)(?:/(\\d\\d))?)?"))) {
			var year = +RegExp.$1, month = RegExp.$2 - 1, day = +RegExp.$3;
			entries = entries.filter(function (i) {
				return [
					{k:"getFullYear",v:year},
					{k:"getMonth", v:month},
					{k:"getDate",v:day}
				].every(function (j) {
					return (j.v <= 0) || i.datetime[j.k]() == j.v
				});
			});
		} else {
			try {
				entries = entries.filter(function (i) {
					if (i.name == path_info) throw ["only-match", i];
					return RegExp("^"+path_info).test(i.name);
				});
			} catch (e) {
				if (e[0] != "only-match") throw e;
				// only match
				entries = [e[1]];
			}
		}


		var template = new EJS(this._readLines("template.html").join("\n"));
		System.out.println(template.run({
			title       : this.config.title,
			author      : this.config.author,
			home        : this.getenv("SCRIPT_NAME") || '/',
			path        : (this.getenv("SCRIPT_NAME") || '/').split("/").slice(-1)[0],
			server_root : "http://" + this.getenv("SERVER_NAME"),
			entries     : entries,
		}));
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

		var self = this;
		var files = _getFiles(File(self.config.data_dir));
		var entries = files.map(function (i) {
			var content = self._readLines(i);
			return {
				file     : i,
				name     : String(i).replace(RegExp("^"+self.config.data_dir+"|\\..*$", "g"), ""),
				datetime : new Date(i.lastModified()),
				title    : String(content.shift()),
				body     : content.join("\n"),
			};
		});
		return entries;
	},

	_readLines : function (file) {
		var br = new BufferedReader(
			new InputStreamReader(
				new FileInputStream(file),
				"UTF-8"
			)
		);
		var ret = [];
		while (br.ready()) ret.push(br.readLine());
		return ret;
	},

	getenv : function (name) {
		return String(System.getenv(name) || "");
	},
};

new BlosxomRhino({
	title    : "Blosxom.Rhino!",
	data_dir : "data",
}).run();
