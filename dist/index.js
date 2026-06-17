//#region src/createProxyFactory.ts
var e = Symbol("localeKey");
function t(t) {
	return function n(r = "") {
		let i = function n(...r) {
			let i = n[e];
			return t(i, ...r);
		};
		return i[e] = r, new Proxy(i, {
			get(t, r) {
				if (r === Symbol.toPrimitive || r === "toString" || r === "valueOf") return () => i();
				if (typeof r == "symbol" && (r === Symbol.iterator || r === Symbol.asyncIterator)) throw Error("Symbol properties are not supported in dot-notation navigation");
				let a = t[e], o = typeof r == "symbol" ? String(r) : r;
				return a && (o = a + "." + o), n(o);
			},
			apply(e, t, n) {
				return Reflect.apply(e, t, n);
			}
		});
	};
}
//#endregion
//#region src/index.ts
function n(e, n) {
	let r = n?.cache;
	if (r) {
		let n = r.get("");
		if (n) return n;
		let i = t(e)();
		return r.set("", i), i;
	}
	return t(e)();
}
//#endregion
export { n as default };
