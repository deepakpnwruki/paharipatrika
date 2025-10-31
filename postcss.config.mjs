import purgecss from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    'postcss-flexbugs-fixes',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
        features: {
          'custom-properties': false,
        },
      },
    ],
    ...(process.env.NODE_ENV === 'production'
      ? [
          purgecss({
            content: [
              './pages/**/*.{js,ts,jsx,tsx}',
              './components/**/*.{js,ts,jsx,tsx}',
              './app/**/*.{js,ts,jsx,tsx}',
            ],
            defaultExtractor: (content) =>
              content.match(/[\u00000-\w-/:]+(?<!:)/g) || [],
          }),
        ]
      : []),
  ],
};
