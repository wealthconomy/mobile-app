module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // ❌ Remove this line below
    // plugins: ["react-native-reanimated/plugin"],
  };
};