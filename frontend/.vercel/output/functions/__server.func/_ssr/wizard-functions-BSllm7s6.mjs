import { c as createServerRpc } from "./createServerRpc-29xaFZcb.mjs";
import { b as createServerFn, g as getRequest, e as auth, j as env } from "./index.mjs";
import { o as object, r as record, s as string, b as array, c as any } from "../_libs/zod.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/react.mjs";
import "../_libs/@apm-js-collab/code-transformer.mjs";
import "../_libs/@tanstack/react-router.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/@better-auth/utils.mjs";
import "../_libs/better-call.mjs";
import "../_libs/@noble/hashes.mjs";
import "../_libs/@noble/ciphers.mjs";
import "../_libs/@better-fetch/fetch.mjs";
import "../_libs/jose.mjs";
import "../_libs/defu.mjs";
import "../_libs/@t3-oss/env-core.mjs";
import "../_libs/kysely.mjs";
import "../_libs/drizzle-orm.mjs";
import "../_libs/pg.mjs";
import "events";
import "../_libs/pg-types.mjs";
import "../_libs/postgres-array.mjs";
import "../_libs/postgres-date.mjs";
import "../_libs/postgres-interval.mjs";
import "../_libs/xtend.mjs";
import "../_libs/postgres-bytea.mjs";
import "../_libs/pg-int8.mjs";
import "dns";
import "../_libs/pg-connection-string.mjs";
import "fs";
import "../_libs/pg-protocol.mjs";
import "net";
import "tls";
import "../_libs/pg-cloudflare.mjs";
import "../_libs/pgpass.mjs";
import "path";
import "../_libs/split2.mjs";
import "string_decoder";
import "../_libs/pg-pool.mjs";
const BACKEND_URL = env.VITE_BACKEND_URL;
async function request(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}
async function wizardStart(customerId, description) {
  return request("/api/wizard/start", {
    method: "POST",
    body: { customer_id: customerId, description }
  });
}
async function wizardRefine(serverId, feedback, description) {
  return request(`/api/wizard/${serverId}/refine`, {
    method: "POST",
    body: { feedback, description }
  });
}
async function wizardConfirmActions(serverId, selectedActions) {
  return request(`/api/wizard/${serverId}/tools/select`, {
    method: "POST",
    body: { selected_tool_names: selectedActions }
  });
}
async function wizardConfigureAuth(serverId, authType, authConfig) {
  return request(`/api/wizard/${serverId}/auth`, {
    method: "POST",
    body: { auth_type: authType, auth_config: authConfig }
  });
}
async function wizardGenerateCode(serverId) {
  return request(`/api/wizard/${serverId}/generate-code`, {
    method: "POST"
  });
}
async function wizardGetState(serverId) {
  return request(`/api/wizard/${serverId}`);
}
async function serverActivate(serverId) {
  return request(`/api/servers/${serverId}/activate`, {
    method: "POST"
  });
}
async function serverCreateVPS(serverId) {
  return request(`/api/servers/${serverId}/create-vps`, {
    method: "POST",
    body: { server_id: serverId }
  });
}
async function getTierInfo$1(tier) {
  return request(`/api/servers/tier-info/${tier}`);
}
async function listServers(customerId) {
  return request(`/api/servers/list/${customerId}`);
}
async function getServerDetails(serverId) {
  return request(`/api/servers/${serverId}/details`);
}
async function deleteServer(serverId) {
  return request(`/api/servers/${serverId}`, { method: "DELETE" });
}
async function getSession() {
  const request2 = getRequest();
  if (!request2) {
    throw new Error("Unauthorized");
  }
  const session = await auth.api.getSession({
    headers: request2.headers
  });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
const startWizard_createServerFn_handler = createServerRpc({
  id: "20ecea8294f2158adc9b747f57e5d2e5b4fd03546b8824c5554b9eefac8adea9",
  name: "startWizard",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => startWizard.__executeServer(opts, signal));
const startWizard = createServerFn({
  method: "POST"
}).inputValidator(object({
  description: string()
})).handler(startWizard_createServerFn_handler, async ({
  data
}) => {
  const session = await getSession();
  return wizardStart(session.user.id, data.description);
});
const refineActions_createServerFn_handler = createServerRpc({
  id: "c0fda15e75929864f177f54e5e8294d5792bcdbe988530574f2cd6486897430b",
  name: "refineActions",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => refineActions.__executeServer(opts, signal));
const refineActions = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string(),
  feedback: string(),
  description: string().optional()
})).handler(refineActions_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return wizardRefine(data.serverId, data.feedback, data.description);
});
const confirmActions_createServerFn_handler = createServerRpc({
  id: "09effb21f8e46823d03380fea19a542d6a3235d1c0a1ed8c23670c6f7949ec53",
  name: "confirmActions",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => confirmActions.__executeServer(opts, signal));
const confirmActions = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string(),
  selectedActions: array(string())
})).handler(confirmActions_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return wizardConfirmActions(data.serverId, data.selectedActions);
});
const configureAuth_createServerFn_handler = createServerRpc({
  id: "e3d39b5332d946ce5c426829915767cf5e584ec73ab2e1dac4ba9c43f71f2ca2",
  name: "configureAuth",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => configureAuth.__executeServer(opts, signal));
const configureAuth = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string(),
  authType: string(),
  authConfig: record(string(), any()).optional()
})).handler(configureAuth_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return wizardConfigureAuth(data.serverId, data.authType, data.authConfig);
});
const generateCode_createServerFn_handler = createServerRpc({
  id: "6d03678a1c2be2d629c336cfe0a10cdb99a73b1af5687819f32b0da19c89b9df",
  name: "generateCode",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => generateCode.__executeServer(opts, signal));
const generateCode = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(generateCode_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return wizardGenerateCode(data.serverId);
});
const getWizardState_createServerFn_handler = createServerRpc({
  id: "0cffd6209fa817f9ed662cd50c116d1e5eceb9917ec24257cea6bb920b1ebda1",
  name: "getWizardState",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => getWizardState.__executeServer(opts, signal));
const getWizardState = createServerFn({
  method: "GET"
}).inputValidator(object({
  serverId: string()
})).handler(getWizardState_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return await wizardGetState(data.serverId);
});
const activateServer_createServerFn_handler = createServerRpc({
  id: "3971acf857fdc77781879ff6c71d26423e0bcb6f788a10446019471bce4394ca",
  name: "activateServer",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => activateServer.__executeServer(opts, signal));
const activateServer = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(activateServer_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return serverActivate(data.serverId);
});
const createVPS_createServerFn_handler = createServerRpc({
  id: "03472aabe338f62e2fc7f78b62345f374c528fdf616f1b6b4574dcaeef019750",
  name: "createVPS",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => createVPS.__executeServer(opts, signal));
const createVPS = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(createVPS_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return serverCreateVPS(data.serverId);
});
const getTierInfo_createServerFn_handler = createServerRpc({
  id: "9cd4807d65e22809d81f1aaa89df3a20732710c2f92ca81360660209aad726a5",
  name: "getTierInfo",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => getTierInfo.__executeServer(opts, signal));
const getTierInfo = createServerFn({
  method: "GET"
}).inputValidator(object({
  tier: string()
})).handler(getTierInfo_createServerFn_handler, async ({
  data
}) => {
  return getTierInfo$1(data.tier);
});
const listUserServers_createServerFn_handler = createServerRpc({
  id: "333c2a7e1a8f06223cccea35aef6e21eeaf0250609d410915d4e5f07c0d32be8",
  name: "listUserServers",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => listUserServers.__executeServer(opts, signal));
const listUserServers = createServerFn({
  method: "GET"
}).handler(listUserServers_createServerFn_handler, async () => {
  const session = await getSession();
  return listServers(session.user.id);
});
const getServerDetailsById_createServerFn_handler = createServerRpc({
  id: "b1d6df5d85e04231bbb8f605f039ce817862fb2c25e66eb62814c93fcfc96094",
  name: "getServerDetailsById",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => getServerDetailsById.__executeServer(opts, signal));
const getServerDetailsById = createServerFn({
  method: "GET"
}).inputValidator(object({
  serverId: string()
})).handler(getServerDetailsById_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return getServerDetails(data.serverId);
});
const deleteServerById_createServerFn_handler = createServerRpc({
  id: "1937635825b640b99909e31eacec673b6a0c2c8207f369c69b09c3331f0546c9",
  name: "deleteServerById",
  filename: "src/lib/wizard-functions.ts"
}, (opts, signal) => deleteServerById.__executeServer(opts, signal));
const deleteServerById = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(deleteServerById_createServerFn_handler, async ({
  data
}) => {
  await getSession();
  return deleteServer(data.serverId);
});
export {
  activateServer_createServerFn_handler,
  configureAuth_createServerFn_handler,
  confirmActions_createServerFn_handler,
  createVPS_createServerFn_handler,
  deleteServerById_createServerFn_handler,
  generateCode_createServerFn_handler,
  getServerDetailsById_createServerFn_handler,
  getTierInfo_createServerFn_handler,
  getWizardState_createServerFn_handler,
  listUserServers_createServerFn_handler,
  refineActions_createServerFn_handler,
  startWizard_createServerFn_handler
};
