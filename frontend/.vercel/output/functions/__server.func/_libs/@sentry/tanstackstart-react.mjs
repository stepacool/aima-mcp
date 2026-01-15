import { g as getDefaultIntegrations, i as init$1 } from "./node.mjs";
import { M as applySdkMetadata } from "./core.mjs";
function init(options) {
  const sentryOptions = {
    defaultIntegrations: [...getDefaultIntegrations(options)],
    ...options
  };
  applySdkMetadata(sentryOptions, "tanstackstart-react", ["tanstackstart-react", "node"]);
  return init$1(sentryOptions);
}
export {
  init as i
};
