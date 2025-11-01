// Minimal, safe PostCSS config for Next.js (no PurgeCSS)
export default {
	plugins: {
		'postcss-flexbugs-fixes': {},
		'postcss-preset-env': {
			autoprefixer: {
				flexbox: 'no-2009',
			},
			stage: 3,
			features: {
				'custom-properties': false,
			},
		},
	},
};

