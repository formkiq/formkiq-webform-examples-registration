import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
	input: 'src/index.js',
	output: {
		file: 'dist/web-cjs/formkiq-client-sdk-cjs.js',
		format: 'cjs',
		name: 'platformClient',
		interop: 'auto',
		intro: 'var exports = {"__esModule": true};'
	},
	plugins: [ 
    nodePolyfills(),
		resolve(
			{
				browser: true,
				preferBuiltins: true 
			}
		),
		commonjs(
			{
				include: 'node_modules/**',  // Default: undefined
				browser: true,
				preferBuiltins: true,
				ignoreGlobal: false,
				sourceMap: true
			})
	],
	external: [
		'stream',
		'http',
		'https',
		'url',
		'zlib'
	]
};