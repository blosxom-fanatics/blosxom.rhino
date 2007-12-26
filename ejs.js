#!rhino

EJS = function (template, opts) { return (this instanceof EJS) ? this.initialize(template, opts) : new EJS(template, opts) };
EJS.prototype = {
	initialize : function (template, opts) {
		this.template  = template;
		this.processor = this.compile(template, opts || {});
		// print(this.processor);
	},

	run : function (stash) {
		return this.processor(stash);
	},

	compile : function (s, opts) {
		s = String(s);
		ret = [
			'var ret = [];',
			'ret.push(""'
		];

		var m, c, flag;
		while (m = s.match(/<%(=*)/)) {
			flag = m[1];
			ret.push(',', uneval(s.slice(0, m.index)));
			s = s.slice(m.index + m[0].length);
			m = s.match(/(.*?)%>/);
			s = s.slice(m.index + m[0].length);
			c = m[1];
			switch (flag) {
				case "=":
				case "==":
					ret.push(', (', c,').replace(/[&<>]/g, f)');
					break;
				case "===":
					ret.push(',', c);
					break;
				default:
					ret.push(");", c, "\nret.push(''");
					break;
			}
		}
		ret.push(
			',', uneval(s), ');',
			'return ret.join("");'
		);
		if (opts.useWith) {
			ret.unshift("with (s) {");
			ret.push("}");
		}
		ret.unshift(
			'var map = { "&" : "&amp;", "<" : "&lt;" , ">" : "&gt;"}, f = function (m) {return map[m]};',
			"return function (s) {"
		);
		ret.push("}");
		return (new Function(ret.join(''))).call();
	}
};


//---

//var tester = [
//	"aaaa<%=foo%>bbbbb<%=bar%>ccc",
//	"aaaa<% if (foo) {%>bbbb<%=bar%><%}%>ccc",
//];
//
//for (var i = 0; i < tester.length; i++) {
//	var t = EJS(tester[i], {useWith: true});
//	print(t.processor);
//	print(t.run({foo:"test", bar:"foobar"}));
//}
//
//COUNT = 500;
//
//var t = "aaaa<%=s.foo%>bbbbb<%=s.bar%>ccc";
//var e = EJS(t);
//var f = EJS(t, {useWith:true});
//var m = {foo:"test", bar:"foobar"};
//var b = [
//	function compile () {
//		EJS(t);
//	},
//	function processing () {
//		e.run(m);
//	},
//	function processing_with_with () {
//		f.run(m);
//	},
//	function replace () {
//		t.replace(/<%=s\.(\w+)%>/, function (_,a) {
//			return m[a];
//		});
//	}
//];
//
//
//for (var i = 0; i < b.length; i++) {
//	var fun = b[i];
//	print(fun.name);
//	var res = 0;
//	for (var j = 0; j < COUNT; j++) {
//		var now = (new Date).getTime();
//		fun();
//		res += (new Date).getTime() - now;
//	}
//	print(res + "ms / " + (res/COUNT) + "ms");
//};

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
