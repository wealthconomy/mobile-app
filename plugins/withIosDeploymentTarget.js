const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withIosDeploymentTarget = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      if (fs.existsSync(podfilePath)) {
        let content = fs.readFileSync(podfilePath, "utf-8");
        const hook = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      end
    end
`;
        if (!content.includes("config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'")) {
          content = content.replace(
            /post_install do \|installer\|/g,
            `post_install do |installer|\n${hook}`
          );
          fs.writeFileSync(podfilePath, content);
        }
      }
      return config;
    },
  ]);
};

module.exports = withIosDeploymentTarget;
