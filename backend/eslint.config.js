import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // lỗi nghiêm trọng
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn", {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],

      "no-undef": "off",

      // code sạch
      "eqeqeq": "error",
      "curly": "error",

      // relax cho backend
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
