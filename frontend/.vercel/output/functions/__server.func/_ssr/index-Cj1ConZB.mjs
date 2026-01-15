import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/@tanstack/react-router.mjs";
import { a as useQuery, b as useMutation } from "../_libs/@tanstack/react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { j as env } from "./index.mjs";
import { s as startWizard, r as refineActions, c as confirmActions, a as configureAuth, g as generateCode, b as activateServer, e as createVPS, f as getWizardState, h as getTierInfo } from "./wizard-functions-C2GBlcq2.mjs";
import { b as Route$1 } from "./router-Z-nK48G6.mjs";
import "../_libs/@apm-js-collab/code-transformer.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/@tanstack/query-core.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/@better-auth/utils.mjs";
import "../_libs/better-call.mjs";
import "../_libs/zod.mjs";
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
import "../_libs/@tanstack/react-router-ssr-query.mjs";
import "../_libs/@tanstack/router-ssr-query-core.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/nanostores.mjs";
import "../_libs/@sentry/tanstackstart-react.mjs";
import "../_libs/@sentry/node.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "../_libs/@opentelemetry/instrumentation-http.mjs";
import "../_libs/@opentelemetry/core.mjs";
import "perf_hooks";
import "../_libs/@opentelemetry/semantic-conventions.mjs";
import "url";
import "../_libs/@opentelemetry/instrumentation.mjs";
import "../_libs/@opentelemetry/api-logs.mjs";
import "../_libs/require-in-the-middle.mjs";
import "module";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/module-details-from-path.mjs";
import "../_libs/import-in-the-middle.mjs";
import "worker_threads";
import "../_libs/forwarded-parse.mjs";
import "../_libs/@sentry/core.mjs";
import "../_libs/@sentry/node-core.mjs";
import "../_libs/@opentelemetry/context-async-hooks.mjs";
import "../_libs/@sentry/opentelemetry.mjs";
import "../_libs/@opentelemetry/sdk-trace-base.mjs";
import "../_libs/@opentelemetry/resources.mjs";
import "node:diagnostics_channel";
import "node:child_process";
import "node:fs";
import "node:os";
import "node:path";
import "node:util";
import "node:readline";
import "node:events";
import "node:worker_threads";
import "diagnostics_channel";
import "node:http";
import "node:https";
import "node:zlib";
import "node:net";
import "node:tls";
import "../_libs/@opentelemetry/instrumentation-undici.mjs";
import "../_libs/@opentelemetry/instrumentation-amqplib.mjs";
import "../_libs/@opentelemetry/instrumentation-connect.mjs";
import "../_libs/@opentelemetry/instrumentation-express.mjs";
import "../_libs/minimatch.mjs";
import "../_libs/brace-expansion.mjs";
import "../_libs/balanced-match.mjs";
import "../_libs/@opentelemetry/instrumentation-generic-pool.mjs";
import "../_libs/@opentelemetry/instrumentation-graphql.mjs";
import "../_libs/@opentelemetry/instrumentation-hapi.mjs";
import "../_libs/@opentelemetry/instrumentation-kafkajs.mjs";
import "../_libs/@opentelemetry/instrumentation-koa.mjs";
import "../_libs/@opentelemetry/instrumentation-lru-memoizer.mjs";
import "../_libs/@opentelemetry/instrumentation-mongodb.mjs";
import "../_libs/@opentelemetry/instrumentation-mongoose.mjs";
import "../_libs/@opentelemetry/instrumentation-mysql.mjs";
import "../_libs/@opentelemetry/instrumentation-mysql2.mjs";
import "../_libs/@opentelemetry/sql-common.mjs";
import "../_libs/@opentelemetry/instrumentation-pg.mjs";
import "../_libs/@prisma/instrumentation.mjs";
import "../_libs/@opentelemetry/instrumentation-ioredis.mjs";
import "../_libs/@opentelemetry/redis-common.mjs";
import "../_libs/@opentelemetry/instrumentation-redis.mjs";
import "../_libs/@opentelemetry/instrumentation-tedious.mjs";
const steps = [
  { num: 1, label: "Describe" },
  { num: 2, label: "Actions" },
  { num: 3, label: "Auth" },
  { num: 4, label: "Deploy" }
];
function WizardProgress({
  currentStep,
  loadingStep,
  unlockedSteps = [],
  onStepClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center mb-8 gap-0", role: "progressbar", "aria-valuenow": currentStep, "aria-valuemin": 1, "aria-valuemax": 4, "aria-label": `Wizard progress: step ${currentStep} of 4`, children: steps.map((step, idx) => {
    const isCompleted = step.num < currentStep;
    const isCurrent = step.num === currentStep;
    const isLoading = loadingStep === step.num;
    const isUnlocked = unlockedSteps.includes(step.num);
    const isClickable = isUnlocked && onStepClick && !isLoading;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            onClick: () => isClickable && onStepClick(step.num),
            className: `w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all relative
                  ${isCompleted ? "bg-green-500 border-green-500 text-white" : isCurrent ? "bg-indigo-500 border-indigo-500 text-white" : isUnlocked ? "bg-slate-800 border-slate-600 text-slate-400 border-2 hover:border-indigo-500 hover:text-indigo-400" : "bg-slate-800 border-slate-600 text-slate-400 border-2 opacity-50"}
                  ${isClickable ? "cursor-pointer" : "cursor-default"}`,
            "aria-label": isLoading ? `Loading ${step.label}` : isCompleted ? `Completed ${step.label}` : isCurrent ? `Current step: ${step.label}` : isUnlocked ? `Click to go to ${step.label}` : `${step.label} (locked)`,
            children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin", "aria-hidden": "true" }) : isCompleted ? "✓" : step.num
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-xs transition-colors ${isCurrent ? "text-white font-medium" : isUnlocked ? "text-slate-400 hover:text-indigo-400" : "text-slate-500"}`,
            children: step.label
          }
        )
      ] }),
      idx < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `w-16 h-0.5 mx-2 mb-6 transition-colors ${step.num < currentStep ? "bg-green-500" : "bg-slate-600"}`,
          "aria-hidden": "true"
        }
      )
    ] }, step.num);
  }) });
}
function WizardProgressIndicator({
  text = "Processing...",
  variant = "inline",
  className = ""
}) {
  if (variant === "inline") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `flex items-center gap-2 text-sm ${className}`,
        role: "status",
        "aria-live": "polite",
        "aria-label": text,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-4 h-4 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin",
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: text })
        ]
      }
    );
  }
  if (variant === "badge") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm ${className}`,
        role: "status",
        "aria-live": "polite",
        "aria-label": text,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-3 h-3 border-2 border-indigo-400 border-t-indigo-200 rounded-full animate-spin",
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-indigo-300 font-medium", children: text })
        ]
      }
    );
  }
  if (variant === "bar") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `w-full ${className}`,
        role: "status",
        "aria-live": "polite",
        "aria-label": text,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-400", children: text }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1.5 bg-slate-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-indigo-500 animate-pulse", style: { width: "100%" } }) })
        ]
      }
    );
  }
  return null;
}
function ActionCard({
  action,
  selected,
  disabled,
  onToggle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onClick: () => !disabled && onToggle(),
      className: `bg-slate-900 rounded-xl p-4 border transition-all
        ${disabled ? "opacity-50 cursor-not-allowed border-slate-700" : selected ? "border-indigo-500 bg-indigo-500/10 cursor-pointer" : "border-slate-700 hover:border-indigo-400 cursor-pointer"}`,
      "aria-disabled": disabled,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: selected,
              disabled,
              onChange: onToggle,
              className: "w-4 h-4"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-indigo-400 font-mono", children: action.name }),
          action.auth_required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-semibold", children: "Auth Required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 text-sm mb-3", children: action.description }),
        action.parameters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: action.parameters.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "text-xs px-2 py-1 rounded bg-slate-700 text-slate-400 font-mono",
            children: [
              p.name,
              ": ",
              p.type || "string"
            ]
          },
          p.name
        )) })
      ]
    }
  );
}
const WIZARD_STEP_MAP = {
  describe: 1,
  actions: 2,
  auth: 3,
  deploy: 4,
  complete: 5
};
function WizardPage() {
  const {
    serverId: initialServerId
  } = Route$1.useSearch();
  const navigate = useNavigate();
  const [state, setState] = reactExports.useState({
    currentStep: 1,
    serverId: initialServerId || null,
    serverName: "",
    serverDescription: "",
    actions: [],
    selectedActions: [],
    authType: "none",
    oauthConfig: {
      providerUrl: "",
      clientId: "",
      scopes: ""
    },
    selectedTier: "free",
    generatedTools: [],
    result: null
  });
  const [description, setDescription] = reactExports.useState("");
  const [refineInput, setRefineInput] = reactExports.useState("");
  const {
    data: serverState,
    isLoading: isLoadingState
  } = useQuery({
    queryKey: ["wizardState", initialServerId],
    queryFn: () => getWizardState({
      data: {
        serverId: initialServerId
      }
    }),
    enabled: !!initialServerId && state.currentStep === 1 && !state.serverName
  });
  reactExports.useEffect(() => {
    if (serverState) {
      console.log("Restoring wizard state:", serverState);
      const step = WIZARD_STEP_MAP[serverState.wizard_step] || 1;
      const tools = serverState.tools || [];
      let actions = [];
      let generatedTools = [];
      let selectedActions = [];
      if (step >= 2) {
        actions = tools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters || [],
          auth_required: false
        }));
        selectedActions = actions.slice(0, 3).map((a) => a.name);
      }
      if (step >= 4) {
        generatedTools = tools.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description
        }));
      }
      setState((s) => ({
        ...s,
        currentStep: step,
        serverId: initialServerId || null,
        serverName: serverState.name,
        serverDescription: serverState.description || "",
        authType: serverState.auth_type || "none",
        oauthConfig: serverState.auth_config || {
          providerUrl: "",
          clientId: "",
          scopes: ""
        },
        actions,
        selectedActions,
        generatedTools
      }));
      const userPrompt = serverState.meta?.user_prompt || serverState.user_prompt;
      if (userPrompt) {
        setDescription(userPrompt);
      } else if (step === 1 && serverState.description) {
        setDescription(serverState.description);
      }
    }
  }, [serverState, initialServerId]);
  const {
    data: tierInfo
  } = useQuery({
    queryKey: ["tierInfo", "free"],
    queryFn: () => getTierInfo({
      data: {
        tier: "free"
      }
    }),
    enabled: state.currentStep === 4
  });
  const startWizardMutation = useMutation({
    mutationFn: (desc) => startWizard({
      data: {
        description: desc
      }
    }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 2,
        serverId: result.server_id,
        serverName: result.server_name,
        serverDescription: result.description,
        actions: result.actions,
        selectedActions: result.actions.slice(0, 3).map((a) => a.name)
      }));
    },
    onError: (error) => toast.error("Error", {
      description: error.message
    })
  });
  const refineActionsMutation = useMutation({
    mutationFn: ({
      serverId,
      feedback,
      description: descriptionParam
    }) => refineActions({
      data: {
        serverId,
        feedback,
        description: descriptionParam
      }
    }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: s.currentStep === 1 ? 2 : s.currentStep,
        // Move to step 2 if coming from step 1
        actions: result.actions,
        selectedActions: result.actions.slice(0, 3).map((a) => a.name)
        // Auto-select first 3 actions
      }));
      setRefineInput("");
    },
    onError: (error) => toast.error("Error", {
      description: error.message
    })
  });
  const confirmActionsMutation = useMutation({
    mutationFn: ({
      serverId,
      selectedActions
    }) => confirmActions({
      data: {
        serverId,
        selectedActions
      }
    }),
    onSuccess: () => {
      setState((s) => ({
        ...s,
        currentStep: 3
      }));
    },
    onError: (error) => toast.error("Error", {
      description: error.message
    })
  });
  const generateCodeMutation = useMutation({
    mutationFn: (serverId) => generateCode({
      data: {
        serverId
      }
    })
  });
  const configureAuthMutation = useMutation({
    mutationFn: async ({
      serverId,
      authType,
      authConfig
    }) => {
      await configureAuth({
        data: {
          serverId,
          authType,
          authConfig
        }
      });
      return generateCodeMutation.mutateAsync(serverId);
    },
    onSuccess: (codeResult) => {
      setState((s) => ({
        ...s,
        currentStep: 4,
        generatedTools: codeResult.tools.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description
        }))
      }));
    },
    onError: (error) => toast.error("Error", {
      description: error.message
    })
  });
  const activateServerMutation = useMutation({
    mutationFn: (serverId) => activateServer({
      data: {
        serverId
      }
    }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          serverId: result.server_id,
          mcpEndpoint: result.mcp_endpoint,
          toolsCount: result.tools_count,
          status: result.status
        }
      }));
    },
    onError: (error) => toast.error("Error", {
      description: error.message
    })
  });
  const createVPSMutation = useMutation({
    mutationFn: (serverId) => createVPS({
      data: {
        serverId
      }
    }),
    onSuccess: (result) => {
      setState((s) => ({
        ...s,
        currentStep: 5,
        result: {
          serverId: result.server_id,
          message: result.message,
          status: result.status,
          ipAddress: result.ip_address
        }
      }));
    },
    onError: (error) => toast.error("Error", {
      description: error.message
    })
  });
  function handleDescribe() {
    if (!description.trim()) return;
    if (state.serverId) {
      refineActionsMutation.mutate({
        serverId: state.serverId,
        feedback: `Update the server based on this new description: ${description}`,
        description
      });
    } else {
      startWizardMutation.mutate(description);
    }
  }
  function handleRefine() {
    if (!refineInput.trim() || !state.serverId) return;
    refineActionsMutation.mutate({
      serverId: state.serverId,
      feedback: refineInput
    });
  }
  function toggleAction(name) {
    setState((s) => {
      if (s.selectedActions.includes(name)) {
        return {
          ...s,
          selectedActions: s.selectedActions.filter((n) => n !== name)
        };
      }
      if (s.selectedTier === "free" && s.selectedActions.length >= 3) {
        toast.error("Free tier limited to 3 actions");
        return s;
      }
      return {
        ...s,
        selectedActions: [...s.selectedActions, name]
      };
    });
  }
  function handleConfirmActions() {
    if (!state.serverId || state.selectedActions.length === 0) return;
    confirmActionsMutation.mutate({
      serverId: state.serverId,
      selectedActions: state.selectedActions
    });
  }
  function handleConfirmAuth() {
    if (!state.serverId) return;
    const authConfig = state.authType === "oauth" ? {
      providerUrl: state.oauthConfig.providerUrl,
      clientId: state.oauthConfig.clientId,
      scopes: state.oauthConfig.scopes.split(",").map((s) => s.trim())
    } : void 0;
    configureAuthMutation.mutate({
      serverId: state.serverId,
      authType: state.authType,
      authConfig
    });
  }
  function handleActivate() {
    if (!state.serverId) return;
    activateServerMutation.mutate(state.serverId);
  }
  function handleDeploy() {
    if (!state.serverId) return;
    createVPSMutation.mutate(state.serverId);
  }
  function handleStartOver() {
    setState({
      currentStep: 1,
      serverId: null,
      serverName: "",
      serverDescription: "",
      actions: [],
      selectedActions: [],
      authType: "none",
      oauthConfig: {
        providerUrl: "",
        clientId: "",
        scopes: ""
      },
      selectedTier: "free",
      generatedTools: [],
      result: null
    });
    setDescription("");
  }
  const isLoadingStep1 = isLoadingState || startWizardMutation.isPending || refineActionsMutation.isPending;
  const isLoadingStep2 = refineActionsMutation.isPending || confirmActionsMutation.isPending;
  const isLoadingStep3 = configureAuthMutation.isPending || generateCodeMutation.isPending;
  const isLoadingStep4 = activateServerMutation.isPending || createVPSMutation.isPending;
  const loadingStep = isLoadingStep1 ? 1 : isLoadingStep2 ? 2 : isLoadingStep3 ? 3 : isLoadingStep4 ? 4 : null;
  const unlockedSteps = [];
  unlockedSteps.push(1);
  if (state.actions.length > 0 || state.serverName) {
    unlockedSteps.push(2);
  }
  if (state.selectedActions.length > 0) {
    unlockedSteps.push(3);
  }
  if (state.generatedTools.length > 0) {
    unlockedSteps.push(4);
  }
  function handleStepClick(step) {
    if (!unlockedSteps.includes(step)) return;
    setState((s) => ({
      ...s,
      currentStep: step
    }));
  }
  const getLoadingText = (step) => {
    if (step === 1) {
      if (startWizardMutation.isPending) return "Analyzing your requirements...";
      if (refineActionsMutation.isPending) return "Updating actions...";
      if (isLoadingState) return "Resuming setup...";
    }
    if (step === 2) {
      if (refineActionsMutation.isPending) return "Updating actions...";
      if (confirmActionsMutation.isPending) return "Confirming tool selection...";
    }
    if (step === 3) {
      if (configureAuthMutation.isPending) return "Configuring authentication...";
      if (generateCodeMutation.isPending) return "Generating tool code...";
    }
    if (step === 4) {
      if (activateServerMutation.isPending) return "Activating on shared runtime...";
      if (createVPSMutation.isPending) return "Deploying to dedicated VPC...";
    }
    return "Processing...";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent", children: "AutoMCP" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mt-2", children: "Build MCP servers through conversation" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WizardProgress, { currentStep: state.currentStep, loadingStep, unlockedSteps, onStepClick: handleStepClick }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "bg-slate-800 rounded-2xl p-6 border border-slate-700", children: [
      state.currentStep === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-white", children: "What should your MCP server do?" }),
          isLoadingStep1 && /* @__PURE__ */ jsxRuntimeExports.jsx(WizardProgressIndicator, { text: getLoadingText(1), variant: "badge" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mb-4", children: "Describe the system or service you want to create." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Example: A server that manages my GitHub repositories...", className: "w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder:text-slate-500 resize-y min-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed", disabled: startWizardMutation.isPending }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleDescribe, disabled: !description.trim() || startWizardMutation.isPending, className: "mt-4 w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2", children: startWizardMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
          "Analyzing..."
        ] }) : "Generate Actions" })
      ] }),
      state.currentStep === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-indigo-400", children: state.serverName }),
          isLoadingStep2 && /* @__PURE__ */ jsxRuntimeExports.jsx(WizardProgressIndicator, { text: getLoadingText(2), variant: "badge" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mb-4", children: state.serverDescription }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 mb-4", children: state.actions.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { action, selected: state.selectedActions.includes(action.name), disabled: confirmActionsMutation.isPending, onToggle: () => toggleAction(action.name) }, action.name)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: refineInput, onChange: (e) => setRefineInput(e.target.value), onKeyDown: (e) => e.key === "Enter" && !refineActionsMutation.isPending && handleRefine(), placeholder: "Add more actions or modify...", className: "flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed", disabled: refineActionsMutation.isPending }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleRefine, disabled: !refineInput.trim() || refineActionsMutation.isPending, className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2", children: refineActionsMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Updating..."
          ] }) : "Refine" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setState((s) => ({
            ...s,
            currentStep: 1
          })), disabled: confirmActionsMutation.isPending, className: "px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg", children: "Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleConfirmActions, disabled: state.selectedActions.length === 0 || confirmActionsMutation.isPending, className: "px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2", children: confirmActionsMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Confirming..."
          ] }) : `Configure Auth (${state.selectedActions.length}/3 Selected)` })
        ] })
      ] }),
      state.currentStep === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-white", children: "Authentication Setup" }),
          isLoadingStep3 && /* @__PURE__ */ jsxRuntimeExports.jsx(WizardProgressIndicator, { text: getLoadingText(3), variant: "badge" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 mb-4", children: "How should actions requiring auth be handled?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 mb-4", children: ["none", "ephemeral", "oauth"].map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `block p-4 bg-slate-900 rounded-lg border cursor-pointer transition-all
                      ${state.authType === type ? "border-indigo-500" : "border-slate-600 hover:border-indigo-400"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "auth-type", value: type, checked: state.authType === type, onChange: () => setState((s) => ({
            ...s,
            authType: type
          })), className: "mr-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-white", children: [
            type === "none" && "No Authentication",
            type === "ephemeral" && "Ephemeral Credentials",
            type === "oauth" && "OAuth Integration"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-400 text-sm mt-1 ml-6", children: [
            type === "none" && "Actions don't require auth or handle it internally",
            type === "ephemeral" && "Credentials passed at runtime (API keys, tokens)",
            type === "oauth" && "Connect to your OAuth provider"
          ] })
        ] }, type)) }),
        state.authType === "oauth" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-4 bg-slate-900 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: state.oauthConfig.providerUrl, onChange: (e) => setState((s) => ({
            ...s,
            oauthConfig: {
              ...s.oauthConfig,
              providerUrl: e.target.value
            }
          })), placeholder: "OAuth Provider URL", className: "w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: state.oauthConfig.clientId, onChange: (e) => setState((s) => ({
            ...s,
            oauthConfig: {
              ...s.oauthConfig,
              clientId: e.target.value
            }
          })), placeholder: "Client ID", className: "w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: state.oauthConfig.scopes, onChange: (e) => setState((s) => ({
            ...s,
            oauthConfig: {
              ...s.oauthConfig,
              scopes: e.target.value
            }
          })), placeholder: "Scopes (comma-separated)", className: "w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setState((s) => ({
            ...s,
            currentStep: 2
          })), disabled: configureAuthMutation.isPending || generateCodeMutation.isPending, className: "px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg", children: "Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleConfirmAuth, disabled: configureAuthMutation.isPending || generateCodeMutation.isPending, className: "px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2", children: configureAuthMutation.isPending || generateCodeMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            generateCodeMutation.isPending ? "Generating..." : "Configuring..."
          ] }) : "Review & Deploy" })
        ] })
      ] }),
      state.currentStep === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-white", children: "Ready to Launch" }),
          isLoadingStep4 && /* @__PURE__ */ jsxRuntimeExports.jsx(WizardProgressIndicator, { text: getLoadingText(4), variant: "badge" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-indigo-400 font-semibold", children: state.serverName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 text-sm", children: state.serverDescription }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-8 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-green-400", children: state.generatedTools.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 text-sm ml-2", children: "Tools" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold text-green-400 capitalize", children: state.authType }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 text-sm ml-2", children: "Auth Type" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-slate-400 text-sm font-semibold mb-2", children: "Choose Your Plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `p-4 bg-slate-900 rounded-lg border cursor-pointer
                    ${state.selectedTier === "free" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-600"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "tier", value: "free", checked: state.selectedTier === "free", onChange: () => setState((s) => ({
              ...s,
              selectedTier: "free"
            })), className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white", children: "Free" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400 font-semibold", children: "$0/mo" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-slate-400 text-sm space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Up to 3 tools" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Shared runtime" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Instant activation" })
            ] }),
            tierInfo?.curated_libraries && tierInfo.curated_libraries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-slate-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Allowed Libraries:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: tierInfo.curated_libraries.map((lib) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded", children: lib }, lib)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `p-4 bg-slate-900 rounded-lg border cursor-pointer
                    ${state.selectedTier === "paid" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-600"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "tier", value: "paid", checked: state.selectedTier === "paid", onChange: () => setState((s) => ({
              ...s,
              selectedTier: "paid"
            })), className: "hidden" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white", children: "Pro" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400 font-semibold", children: "$29/mo" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-slate-400 text-sm space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Unlimited tools" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Any libraries" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Managed VPS" })
            ] })
          ] })
        ] }),
        state.generatedTools.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-slate-400 text-sm font-semibold mb-2", children: "Generated Tools" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: state.generatedTools.map((tool) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-slate-900 rounded-lg border border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-white", children: tool.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500 text-sm ml-2", children: [
              "— ",
              tool.description
            ] })
          ] }) }, tool.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setState((s) => ({
            ...s,
            currentStep: 3
          })), disabled: activateServerMutation.isPending || createVPSMutation.isPending, className: "px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg", children: "Back" }),
          state.selectedTier === "free" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleActivate, disabled: activateServerMutation.isPending, className: "px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2", children: activateServerMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Activating..."
          ] }) : "Activate (Free)" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleDeploy, disabled: createVPSMutation.isPending, className: "px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center gap-2", children: createVPSMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Deploying..."
          ] }) : "Deploy (Dedicated VPC)" })
        ] })
      ] }),
      state.currentStep === 5 && state.result && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "🎉 Your MCP Server is Active!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 rounded-lg p-4 border-l-4 border-indigo-500 mb-6 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-indigo-400 mb-1", children: state.serverName }),
            state.serverDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 text-sm", children: state.serverDescription })
          ] }),
          state.result.mcpEndpoint && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-300 text-sm", children: "MCP Endpoint:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-indigo-400 text-sm break-all bg-slate-800 px-2 py-1 rounded flex-1", children: `${env.VITE_BACKEND_URL}${state.result.mcpEndpoint}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                navigator.clipboard.writeText(`${env.VITE_BACKEND_URL}${state.result.mcpEndpoint}`);
                toast.success("URL copied!");
              }, className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors whitespace-nowrap", children: "Copy" })
            ] })
          ] }),
          state.result.ipAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-300 text-sm", children: "IP Address:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-indigo-400 text-sm", children: state.result.ipAddress })
          ] }),
          state.result.toolsCount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-300 text-sm", children: "Tools Active:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400 font-semibold", children: state.result.toolsCount })
          ] }),
          state.authType !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-300 text-sm", children: "Authentication:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 capitalize", children: state.authType === "ephemeral" ? "Ephemeral Credentials" : "OAuth Integration" })
          ] }),
          state.result.message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 text-sm", children: state.result.message }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          state.result?.serverId && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            const serverId = state.result?.serverId;
            if (serverId) {
              navigate({
                to: "/server/$serverId",
                params: {
                  serverId
                }
              });
            }
          }, className: "flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors", children: "Go to Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleStartOver, className: "flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors", children: "Create Another Server" })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  WizardPage as component
};
