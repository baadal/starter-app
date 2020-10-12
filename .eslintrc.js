module.exports = {
  root: true,
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  settings: {
    react: {
      version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  },
  env: {
    "browser": true,
    "node": true
  },
  plugins: [
    "@typescript-eslint",
    "eslint-plugin-react",
    "eslint-plugin-prettier",
  ],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended", // Uses the recommended rules from eslint-plugin-react
    "airbnb", // Uses the recommended rules from eslint-config-airbnb
    "airbnb-typescript", // Uses the recommended rules from eslint-config-airbnb-typescript
    "airbnb/hooks",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier", // Uses eslint-config-prettier to disable ESLint rules that would conflict with prettier
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/restrict-template-expressions": 0,
    "@typescript-eslint/no-unnecessary-type-assertion": 0,
    "@typescript-eslint/no-misused-promises": 0,
    "@typescript-eslint/no-empty-interface": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/lines-between-class-members": 0,
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "react/prop-types": 0,
    "react/require-default-props": 0,
    "react/prefer-stateless-function": 0,
    "react/jsx-props-no-spreading": 0,
    "react/destructuring-assignment": 0,
    "react/no-danger": 0,
    "no-console": 0,
    "no-void": 0,
    "prefer-template": 0,
    "global-require": 0,
    "import/prefer-default-export": 0,
    "no-param-reassign": 0,
    "no-underscore-dangle": 0,
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": ["error"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  }
};
