module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add plugin to patch PlatformConstants access
      [
        function() {
          return {
            visitor: {
              MemberExpression(path) {
                // Intercept NativeModules.PlatformConstants access
                if (
                  path.node.object &&
                  path.node.object.name === 'NativeModules' &&
                  path.node.property &&
                  path.node.property.name === 'PlatformConstants'
                ) {
                  // Replace with global.PlatformConstants
                  path.replaceWithSourceString('global.PlatformConstants');
                }
              },
            },
          };
        },
      ],
    ],
  };
};
