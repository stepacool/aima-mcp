import { c as createSsrRpc } from "./router-Z-nK48G6.mjs";
import { b as createServerFn } from "./index.mjs";
import { o as object, s as string, b as array, r as record, c as any } from "../_libs/zod.mjs";
const startWizard = createServerFn({
  method: "POST"
}).inputValidator(object({
  description: string()
})).handler(createSsrRpc("20ecea8294f2158adc9b747f57e5d2e5b4fd03546b8824c5554b9eefac8adea9"));
const refineActions = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string(),
  feedback: string(),
  description: string().optional()
})).handler(createSsrRpc("c0fda15e75929864f177f54e5e8294d5792bcdbe988530574f2cd6486897430b"));
const confirmActions = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string(),
  selectedActions: array(string())
})).handler(createSsrRpc("09effb21f8e46823d03380fea19a542d6a3235d1c0a1ed8c23670c6f7949ec53"));
const configureAuth = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string(),
  authType: string(),
  authConfig: record(string(), any()).optional()
})).handler(createSsrRpc("e3d39b5332d946ce5c426829915767cf5e584ec73ab2e1dac4ba9c43f71f2ca2"));
const generateCode = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(createSsrRpc("6d03678a1c2be2d629c336cfe0a10cdb99a73b1af5687819f32b0da19c89b9df"));
const getWizardState = createServerFn({
  method: "GET"
}).inputValidator(object({
  serverId: string()
})).handler(createSsrRpc("0cffd6209fa817f9ed662cd50c116d1e5eceb9917ec24257cea6bb920b1ebda1"));
const activateServer = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(createSsrRpc("3971acf857fdc77781879ff6c71d26423e0bcb6f788a10446019471bce4394ca"));
const createVPS = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(createSsrRpc("03472aabe338f62e2fc7f78b62345f374c528fdf616f1b6b4574dcaeef019750"));
const getTierInfo = createServerFn({
  method: "GET"
}).inputValidator(object({
  tier: string()
})).handler(createSsrRpc("9cd4807d65e22809d81f1aaa89df3a20732710c2f92ca81360660209aad726a5"));
const listUserServers = createServerFn({
  method: "GET"
}).handler(createSsrRpc("333c2a7e1a8f06223cccea35aef6e21eeaf0250609d410915d4e5f07c0d32be8"));
const getServerDetailsById = createServerFn({
  method: "GET"
}).inputValidator(object({
  serverId: string()
})).handler(createSsrRpc("b1d6df5d85e04231bbb8f605f039ce817862fb2c25e66eb62814c93fcfc96094"));
const deleteServerById = createServerFn({
  method: "POST"
}).inputValidator(object({
  serverId: string()
})).handler(createSsrRpc("1937635825b640b99909e31eacec673b6a0c2c8207f369c69b09c3331f0546c9"));
export {
  configureAuth as a,
  activateServer as b,
  confirmActions as c,
  deleteServerById as d,
  createVPS as e,
  getWizardState as f,
  generateCode as g,
  getTierInfo as h,
  getServerDetailsById as i,
  listUserServers as l,
  refineActions as r,
  startWizard as s
};
