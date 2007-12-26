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
			'var ret = [], escapeHTML = (', uneval(EJS.escapeFun), ")();",
			'with (stash) {',
			'ret.push(""'
		];

		var m, c;
		while (m = s.match(/<%(=*)/)) {
			var flag = m[1];
			ret.push(',', uneval(s.slice(0, m.index)));
			s = s.slice(m.index + m[0].length);
			m = s.match(/(.*?)%>/);
			s = s.slice(m.index + m[0].length);
			c = m[1];
			switch (flag) {
				case "=":
				case "==":
					ret.push(', escapeHTML(', c,')');
					break;
				case "===":
					ret.push(',', c);
					break;
				default:
					ret.push(");", c, "\nret.push(''");
					break;
			}
		}
		ret.push(',', uneval(s), ');');

		ret.push('return ret.join("") }');
		return new Function("stash", ret.join(''));
	}
};
EJS.escapeFun = function () {
	var map = { "&" : "&amp;", "<" : "&lt;" , ">" : "&gt;"};
	return function (str) {
		return str.replace(/[&<>]/g, function (m) {
			return map[m];
		});
	};
};

//[
//	"aaaa<%=foo%>bbbbb<%=bar%>ccc",
//	"aaaa<% if (foo) {%>bbbb<%=bar%><%}%>ccc",
//].forEach(function (i) {
//	var t = EJS(i);
//	print(t.processor);
//	print(t.run({foo:"test", bar:"foobar"}));
//});

//importPackage(java.io);
//function _readLines(file) {
//	var br = new BufferedReader(
//		new InputStreamReader(
//			new FileInputStream(file),
//			"UTF-8"
//		)
//	);
//	var ret = [];
//	while (br.ready()) ret.push(br.readLine());
//	return ret;
//}
//var t = new EJS(_readLines(File("template.html")).join("\n"));
//var r = t.run({
//	title : "test",
//	home  : "/",
//	entries : [
//	],
//});
//
//print(r);
//print(t.processor);
