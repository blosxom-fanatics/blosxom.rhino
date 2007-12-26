#!rhino

EJS = function (template) { return (this instanceof EJS) ? this.initialize(template) : new EJS(template) };
EJS.prototype = {
	initialize : function (template) {
		this.template  = template;
		this.processor = this.compile(template);
		// print(this.processor);
	},

	run : function (stash) {
		return this.processor(stash);
	},

	compile : function (s) {
		s = String(s);
		ret = [
			'with (stash) {',
			'var ret = [];'
		];

		var m, c;
		while (m = s.match(/<%(=*)/)) {
			var flag = m[1];
			ret.push('ret.push(', uneval(s.slice(0, m.index)), ');');
			s = s.slice(m.index + m[0].length);
			m = s.match(/(.*?)%>/);
			s = s.slice(m.index + m[0].length);
			c = m[1];
			switch (flag) {
				case "=":
				case "==":
					ret.push('ret.push(EJS.escape(', c,'));');
					break;
				case "===":
					ret.push('ret.push(', c,');');
					break;
				default:
					ret.push(c, "\n");
					break;
			}
		}
		ret.push('ret.push(', uneval(s), ');');

		ret.push('return ret.join("") }');
		return new Function("stash", ret.join(''));
	}
};
EJS.escapeMap ={ "&" : "&amp;", "<" : "&lt;" , ">" : "&gt;"};
EJS.escape = function (str) {
	return str.replace(/[&<>]/g, function (m) {
		return EJS.escapeMap[m];
	});
};

//var t = EJS("aaaa<%=foo%>bbbbb<%=bar%>ccc");
//
//print(t.processor);
//print(t.run({foo:"test", bar:"foobar"}));

/*
importPackage(java.io);
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
var r = new EJS(_readLines(File("template.html")).join("\n")).run({
	title : "test",
	home  : "/",
	entries : [
	],
});

print(r);
*/
