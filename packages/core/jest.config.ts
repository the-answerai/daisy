// Sync object
const config = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // ignore dist
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
export default config;
