"use client";

import { ChevronDownIcon, Loader2Icon, PlugIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface ToolParameter {
	name: string;
	type: string;
	required: boolean;
	description: string;
}

interface Tool {
	id: string;
	name: string;
	description: string;
	code: string;
	parameters: ToolParameter[];
}

interface ToolTesterProps {
	serverId: string;
	tools: Tool[];
	environmentVariables?: Array<{
		id: string;
		name: string;
		description: string;
		value: string | null;
	}>;
}

type ContentItem = { type: string; text?: string; [key: string]: unknown };

export function ToolTester({ serverId, tools, environmentVariables }: ToolTesterProps) {
	const utils = trpc.useUtils();
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [connectError, setConnectError] = useState<string | null>(null);
	const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
	const [formValues, setFormValues] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<ContentItem[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [envEntries, setEnvEntries] = useState(() =>
		(environmentVariables ?? []).map((ev) => ({ key: ev.name, value: "" }))
	);
	const [editedCode, setEditedCode] = useState<string>("");

	const saveCodeMutation = trpc.organization.server.updateTool.useMutation({
		onSuccess: () => {
			toast.success("Code saved");
			utils.organization.server.getDetails.invalidate({ serverId });
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const handleConnect = async () => {
		setIsConnecting(true);
		setConnectError(null);

		const envHeadersMap: Record<string, string> = {};
		for (const { key, value } of envEntries) {
			if (key.trim() && value.trim()) envHeadersMap[key.trim().toUpperCase()] = value;
		}

		try {
			const res = await fetch("/api/mcp-init", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					serverId,
					...(Object.keys(envHeadersMap).length > 0 ? { envHeaders: envHeadersMap } : {}),
				}),
			});
			const data = await res.json();
			if (!res.ok || data.error) {
				setConnectError(data.error ?? "Failed to connect");
			} else {
				setSessionId(data.sessionId as string);
			}
		} catch {
			setConnectError("Network error: failed to connect");
		} finally {
			setIsConnecting(false);
		}
	};

	const selectedTool = tools.find((t) => t.id === selectedToolId) ?? null;

	const handleSelectTool = (tool: Tool) => {
		setSelectedToolId(tool.id);
		setFormValues({});
		setResult(null);
		setError(null);
		setEnvEntries((environmentVariables ?? []).map((ev) => ({ key: ev.name, value: "" })));
		setEditedCode(tool.code ?? "");
	};

	const hasAllRequired = selectedTool
		? selectedTool.parameters
				.filter((p) => p.required)
				.every((p) => {
					const val = formValues[p.name];
					if (p.type === "boolean") return true; // switch always has a value
					return val !== undefined && val !== "";
				})
		: false;

	const handleRun = async () => {
		if (!selectedTool) return;
		setIsLoading(true);
		setResult(null);
		setError(null);

		const args: Record<string, unknown> = {};
		for (const param of selectedTool.parameters) {
			const raw = formValues[param.name];
			if (raw === undefined || raw === "") continue;
			if (param.type === "boolean") {
				args[param.name] = raw === "true";
			} else if (param.type === "integer") {
				args[param.name] = Number.parseInt(raw, 10);
			} else if (param.type === "number") {
				args[param.name] = Number(raw);
			} else if (param.type === "array" || param.type === "object") {
				try {
					args[param.name] = JSON.parse(raw);
				} catch {
					setError(`Invalid JSON for parameter "${param.name}"`);
					setIsLoading(false);
					return;
				}
			} else {
				args[param.name] = raw;
			}
		}

		const envHeadersMap: Record<string, string> = {};
		for (const { key, value } of envEntries) {
			if (key.trim() && value.trim()) envHeadersMap[key.trim().toUpperCase()] = value;
		}

		try {
			const res = await fetch("/api/mcp-call", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					serverId,
					toolName: selectedTool.name,
					arguments: args,
					...(Object.keys(envHeadersMap).length > 0 ? { envHeaders: envHeadersMap } : {}),
					...(sessionId ? { sessionId } : {}),
				}),
			});
			const data = await res.json();
			if (!res.ok || data.error) {
				setError(
					typeof data.error === "object"
						? (data.error?.message ?? "Tool call failed")
						: (data.error ?? "Tool call failed"),
				);
			} else {
				setResult(data.content as ContentItem[]);
			}
		} catch {
			setError("Network error: failed to call tool");
		} finally {
			setIsLoading(false);
		}
	};

	if (!sessionId) {
		return (
			<Card className="h-fit">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Tool Tester</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
						<PlugIcon className="size-8 text-muted-foreground" />
						<div className="space-y-1">
							<p className="text-sm font-medium">Connect to MCP server</p>
							<p className="text-xs text-muted-foreground">to start testing tools.</p>
						</div>
						{connectError && (
							<p className="text-xs text-destructive">{connectError}</p>
						)}
						<Button size="sm" onClick={handleConnect} disabled={isConnecting}>
							{isConnecting ? (
								<>
									<Loader2Icon className="mr-2 size-4 animate-spin" />
									Connecting...
								</>
							) : (
								"Try tools out"
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-fit">
			<CardHeader className="pb-3 flex flex-row items-center justify-between">
				<CardTitle className="text-base">Tool Tester</CardTitle>
				<Badge variant="outline" className="text-xs font-normal text-green-600 border-green-300 bg-green-50">
					Connected
				</Badge>
			</CardHeader>
			<CardContent className="p-0">
				<div className="flex min-h-[400px]">
					{/* Left: tool list */}
					<div className="w-[35%] shrink-0 border-r">
						<div className="overflow-y-auto">
							{tools.map((tool) => (
								<button
									key={tool.id}
									type="button"
									onClick={() => handleSelectTool(tool)}
									className={cn(
										"w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer hover:bg-muted/50",
										selectedToolId === tool.id
											? "bg-muted font-medium"
											: "text-muted-foreground",
									)}
								>
									{tool.name}
								</button>
							))}
						</div>
					</div>

					{/* Right: form + result */}
					<div className="flex-1 min-w-0 p-4">
						{!selectedTool ? (
							<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
								Select a tool to test it
							</div>
						) : (
							<div className="space-y-4">
								<div>
									<p className="font-medium text-sm">{selectedTool.name}</p>
									{selectedTool.description && (
										<p className="mt-1 text-xs text-muted-foreground">
											{selectedTool.description}
										</p>
									)}
								</div>

								{selectedTool.parameters.length > 0 && (
									<>
										<Separator />
										<div className="space-y-3">
											{selectedTool.parameters.map((param) => (
												<div key={param.name} className="space-y-1">
													<Label className="text-xs">
														{param.name}
														{param.required && (
															<span className="ml-0.5 text-destructive">*</span>
														)}
													</Label>
													{param.description && (
														<p className="text-xs text-muted-foreground">
															{param.description}
														</p>
													)}
													{param.type === "boolean" ? (
														<Switch
															checked={formValues[param.name] === "true"}
															onCheckedChange={(checked) =>
																setFormValues((prev) => ({
																	...prev,
																	[param.name]: checked ? "true" : "false",
																}))
															}
														/>
													) : param.type === "array" ||
													  param.type === "object" ? (
														<Textarea
															placeholder={`Enter JSON ${param.type}`}
															className="font-mono text-xs resize-none"
															rows={3}
															value={formValues[param.name] ?? ""}
															onChange={(e) =>
																setFormValues((prev) => ({
																	...prev,
																	[param.name]: e.target.value,
																}))
															}
														/>
													) : (
														<Input
															type={
																param.type === "integer" ||
																param.type === "number"
																	? "number"
																	: "text"
															}
															step={param.type === "integer" ? "1" : undefined}
															placeholder={param.name}
															className="text-sm"
															value={formValues[param.name] ?? ""}
															onChange={(e) =>
																setFormValues((prev) => ({
																	...prev,
																	[param.name]: e.target.value,
																}))
															}
														/>
													)}
												</div>
											))}
										</div>
									</>
								)}

								<Separator />

								{envEntries.length > 0 && (
									<Collapsible>
										<CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
											<span className="flex items-center gap-1.5">
												Environment Overrides
												{envEntries.filter((e) => e.value.trim()).length > 0 && (
													<span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
														{envEntries.filter((e) => e.value.trim()).length}
													</span>
												)}
											</span>
											<ChevronDownIcon className="size-3.5 transition-transform duration-200 data-[state=open]:rotate-180" />
										</CollapsibleTrigger>
										<CollapsibleContent className="mt-2 space-y-2">
											{envEntries.map((entry, idx) => (
												<div key={idx} className="flex items-center gap-2">
													<span className="font-mono text-xs text-muted-foreground w-1/2 shrink-0">{entry.key}</span>
													<Input
														placeholder="override value"
														className="text-xs h-7 flex-1"
														value={entry.value}
														onChange={(e) =>
															setEnvEntries((prev) =>
																prev.map((en, i) =>
																	i === idx ? { ...en, value: e.target.value } : en,
																)
															)
														}
													/>
												</div>
											))}
										</CollapsibleContent>
									</Collapsible>
								)}

								<Collapsible defaultOpen>
									<CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
										<span className="flex items-center gap-1.5">
											Source Code
											{editedCode !== (selectedTool.code ?? "") && (
												<span className="size-1.5 rounded-full bg-orange-400" />
											)}
										</span>
										<ChevronDownIcon className="size-3.5 transition-transform duration-200 data-[state=open]:rotate-180" />
									</CollapsibleTrigger>
									<CollapsibleContent className="mt-2 space-y-2">
										<Textarea
											value={editedCode}
											onChange={(e) => setEditedCode(e.target.value)}
											className="font-mono text-xs resize-y"
											rows={12}
										/>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												saveCodeMutation.mutate({
													serverId,
													toolId: selectedTool.id,
													description: selectedTool.description,
													code: editedCode,
												})
											}
											disabled={
												saveCodeMutation.isPending ||
												editedCode === (selectedTool.code ?? "")
											}
										>
											{saveCodeMutation.isPending ? (
												<>
													<Loader2Icon className="mr-2 size-3 animate-spin" />
													Saving...
												</>
											) : (
												"Save Code"
											)}
										</Button>
									</CollapsibleContent>
								</Collapsible>

								<Button
									size="sm"
									onClick={handleRun}
									disabled={
										isLoading ||
										(selectedTool.parameters.some((p) => p.required) &&
											!hasAllRequired)
									}
									className="w-full"
								>
									{isLoading ? (
										<>
											<Loader2Icon className="mr-2 size-4 animate-spin" />
											Running...
										</>
									) : (
										"Run Tool"
									)}
								</Button>

								{isLoading && (
									<div className="flex justify-center py-4">
										<Loader2Icon className="size-6 animate-spin text-muted-foreground" />
									</div>
								)}

								{error && (
									<div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
										{error}
									</div>
								)}

								{result !== null && !isLoading && (
									<div className="rounded-md border bg-muted/50 p-3">
										<pre className="overflow-x-auto text-xs">
											{JSON.stringify(result, null, 2)}
										</pre>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
