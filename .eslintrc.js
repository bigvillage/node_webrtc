// .eslintrc.js
module.exports = {
  // 현재 eslintrc 파일을 기준으로 ESLint 규칙을 적용
  root: true,
  env: {
    // eslint를 node에서 사용중인지 여부
    node: true,
    // es6 문법을 사용중인지 여부
    es6: true,
  },
  // eslint server가 linting할 떄 기준으로 사용할 javascript 버전
  parserOptions: {
    ecmaVersion: "latest",
  },
  // 추가적인 규칙들을 적용
  // eslint 권장규칙, prettier 규칙, prettier 권장규칙
  extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],
  // prettier 플러그인 추가
  plugins: ["prettier"],
  // 사용자 편의 규칙 추가
  rules: {
    // no-console 옵션. 개발일 땐 'off'로 에러가 없지만, 배포시 소스에 console.log가 있을경우 에러처리
    // "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": [
      "error",
      // 아래 규칙들은 개인 선호에 따라 prettier 문법 적용,
      // 협업시 팀원과 논의 후 코드 스타일 지정
      // https://prettier.io/docs/en/options.html
      {
        singleQuote: false,
        semi: true,
        useTabs: false,
        tabWidth: 2,
        trailingComma: "es5",
        printWidth: 80,
        bracketSpacing: true,
        arrowParens: "avoid",
        endOfLine: "auto",
      },
    ],
  },
};
