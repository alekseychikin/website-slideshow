var babel = require('@babel/core')
var path = require('path')
var fs = require('fs')
var esbuild = require('esbuild')

function build(filename, code, options) {
	fs.writeFileSync(path.resolve(filename), esbuild.transformSync(code, options).code)
}

babel.transformFile(
	path.resolve('./src/index.mjs'),
	{},
	function(err, result) {
		build('./dist/index.min.js', result.code, {
			format: 'iife',
			minify: true,
			globalName: 'ScrollSlide',
			target: ['es5']
		})
		build('./dist/index.min.mjs', result.code, {
			format: 'esm',
			minify: true,
			target: ['es5']
		})
		build('./dist/index.js', result.code, {
			format: 'cjs',
			target: ['es5']
		})
	}
)
