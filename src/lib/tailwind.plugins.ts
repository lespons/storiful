const plugin = require('tailwindcss/plugin');

const plugins = {
  plugins: [
    plugin(function ({ addVariant, e }: any) {
      addVariant('not-first', ({ modifySelectors, separator }: any) => {
        modifySelectors(({ className }: { className: string }) => {
          return `.${e(`not-first${separator}${className}`)}:not(:first-child)`;
        });
      });
    })
  ]
};
export { plugins };
