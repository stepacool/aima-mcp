"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { AlertCircleIcon, SparklesIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai/conversation";
import { Loader } from "@/components/ai/loader";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai/message";
import {
	type ChatStatus,
	PromptInput,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai/suggestion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/user/user-avatar";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { extractReadyDescription, isReadyToStart } from "@/lib/wizard/prompts";
import type { WizardMessage } from "@/schemas/wizard-schemas";

interface StepZeroChatProps {
	sessionId: string;
	organizationId: string;
	initialMessages: WizardMessage[];
	onReady: (description: string) => void;
	onMessagesUpdate: (messages: WizardMessage[]) => void;
}

// Helper function to extract text content from message parts
function getMessageText(
	message: ReturnType<typeof useChat>["messages"][number],
): string {
	const textPart = message.parts?.find((part) => part.type === "text");
	if (textPart && typeof textPart.text === "string") {
		return textPart.text;
	}
	const msg = message as { content?: string };
	if (typeof msg.content === "string") {
		return msg.content;
	}
	return "";
}

export function StepZeroChat({
	sessionId,
	organizationId,
	initialMessages,
	onReady,
	onMessagesUpdate,
}: StepZeroChatProps) {
	const { user } = useSession();
	const [input, setInput] = useState("");

	// Track if we've already detected readiness to prevent double-firing
	const readinessDetectedRef = useRef(false);
	// Track if we've already initialized from props to prevent re-initialization loop
	const initializedRef = useRef(false);
	// Track streaming errors to display in UI
	const [streamError, setStreamError] = useState<string | null>(null);

	const { messages, setMessages, sendMessage, status } = useChat({
		id: sessionId,
		transport: new TextStreamChatTransport({
			api: "/api/ai/wizard-chat",
			body: {
				organizationId,
			},
		}),
		onError: (err) => {
			// Handle streaming errors (e.g., API key issues)
			setStreamError(err.message || "Failed to get a response");
		},
		onFinish: () => {
			// Clear any previous errors on successful completion
			setStreamError(null);
			// Check the last assistant message for readiness marker
			// We need to do this on next tick to ensure messages are updated
			setTimeout(() => {
				const lastMessage = messages[messages.length - 1];
				if (lastMessage && lastMessage.role === "assistant") {
					const text = getMessageText(lastMessage);
					if (!readinessDetectedRef.current && isReadyToStart(text)) {
						const description = extractReadyDescription(text);
						if (description) {
							readinessDetectedRef.current = true;
							onReady(description);
						}
					}
				}
			}, 0);
		},
	});

	// Initialize messages from props (only once on mount)
	useEffect(() => {
		if (initializedRef.current) return;

		if (initialMessages.length > 0) {
			initializedRef.current = true;
			const parsedMessages = initialMessages.map((msg, i) => ({
				id: msg.id || `msg-${i}`,
				role: msg.role as "user" | "assistant",
				parts: [{ type: "text" as const, text: msg.content }],
			}));
			setMessages(parsedMessages as ReturnType<typeof useChat>["messages"]);

			// Check if any initial message already contains the ready marker
			const lastAssistantMessage = initialMessages
				.filter((m) => m.role === "assistant")
				.pop();
			if (
				lastAssistantMessage &&
				!readinessDetectedRef.current &&
				isReadyToStart(lastAssistantMessage.content)
			) {
				const description = extractReadyDescription(
					lastAssistantMessage.content,
				);
				if (description) {
					readinessDetectedRef.current = true;
					onReady(description);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Check for readiness marker when messages change
	useEffect(() => {
		if (messages.length > 0 && !readinessDetectedRef.current) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage && lastMessage.role === "assistant") {
				const text = getMessageText(lastMessage);
				if (isReadyToStart(text)) {
					const description = extractReadyDescription(text);
					if (description) {
						readinessDetectedRef.current = true;
						onReady(description);
					}
				}
			}
		}
	}, [messages, onReady]);

	// Update parent when messages change (but not during initialization)
	const lastMessageCountRef = useRef(0);
	useEffect(() => {
		// Skip if no messages or if count hasn't changed (avoid duplicate updates)
		if (
			messages.length === 0 ||
			messages.length === lastMessageCountRef.current
		) {
			return;
		}
		lastMessageCountRef.current = messages.length;

		const wizardMessages: WizardMessage[] = messages.map((m, i) => ({
			id: m.id || `msg-${i}`,
			role: m.role as "user" | "assistant",
			content: getMessageText(m),
			createdAt: new Date().toISOString(),
		}));
		onMessagesUpdate(wizardMessages);
	}, [messages, onMessagesUpdate]);

	const isStreaming = status === "streaming" || status === "submitted";
	const chatStatus: ChatStatus = isStreaming ? "streaming" : "ready";

	// Filter out empty assistant messages (can happen on API errors)
	const displayMessages = messages.filter((m) => {
		if (m.role === "assistant") {
			const text = getMessageText(m);
			return text.trim().length > 0;
		}
		return true;
	});

	const handleSendMessage = useCallback(
		async (text: string) => {
			if (!text.trim()) return;

			// Clear any previous errors when sending a new message
			setStreamError(null);

			sendMessage({
				role: "user",
				parts: [{ type: "text", text: text.trim() }],
			});
		},
		[sendMessage],
	);

	const onSubmit = () => {
		const text = input.trim();
		if (!text) return;

		handleSendMessage(text);
		setInput("");
	};

	return (
		<div className="flex h-full flex-col">
			{/* Messages */}
			<Conversation className="min-h-0 flex-1">
				<ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-8">
					{displayMessages.length === 0 && !streamError ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
							<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
								<SparklesIcon className="size-8 text-primary" />
							</div>
							<div className="flex flex-col gap-2">
								<h2 className="font-semibold text-2xl">
									What would you like to build?
								</h2>
								<p className="max-w-md text-muted-foreground">
									Describe the MCP server you want to create. I'll help you
									figure out the tools and functionality you need.
								</p>
							</div>
							<Suggestions className="mt-4 flex-wrap justify-center">
								<Suggestion
									suggestion="Connect to my company's Notion workspace"
									onClick={handleSendMessage}
								/>
								<Suggestion
									suggestion="Wrap my REST API for AI access"
									onClick={handleSendMessage}
								/>
								<Suggestion
									suggestion="What is an MCP server?"
									onClick={handleSendMessage}
								/>
								<Suggestion
									suggestion="Show me some examples"
									onClick={handleSendMessage}
								/>
							</Suggestions>
						</div>
					) : (
						<>
							{displayMessages.map((message) => (
								<Message key={message.id} from={message.role}>
									<div
										className={cn(
											"flex w-full gap-4",
											message.role === "user" && "flex-row-reverse",
										)}
									>
										{message.role === "assistant" ? (
											<Avatar className="size-8 shrink-0">
												<AvatarFallback className="bg-primary text-primary-foreground">
													<SparklesIcon className="size-4" />
												</AvatarFallback>
											</Avatar>
										) : (
											<UserAvatar
												name={user?.name ?? "User"}
												src={user?.image}
												className="size-8 shrink-0"
											/>
										)}
										<div className="flex min-w-0 flex-1 flex-col gap-1">
											<MessageContent
												className={cn(
													"max-w-none",
													message.role === "user" &&
														"rounded-2xl bg-secondary px-4 py-3",
												)}
											>
												{message.role === "assistant" ? (
													<MessageResponse>
														{getMessageText(message)}
													</MessageResponse>
												) : (
													<span className="whitespace-pre-wrap">
														{getMessageText(message)}
													</span>
												)}
											</MessageContent>
										</div>
									</div>
								</Message>
							))}

							{/* Error message */}
							{streamError && (
								<div className="flex w-full gap-4">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
										<AlertCircleIcon className="size-4 text-destructive" />
									</div>
									<div className="flex min-w-0 flex-1 flex-col gap-1">
										<div className="rounded-2xl bg-destructive/10 px-4 py-3 text-destructive">
											<p className="font-medium">Something went wrong</p>
											<p className="text-sm opacity-80">{streamError}</p>
										</div>
									</div>
								</div>
							)}
						</>
					)}

					{isStreaming &&
						displayMessages[displayMessages.length - 1]?.role === "user" && (
							<Message from="assistant">
								<div className="flex w-full gap-4">
									<Avatar className="size-8 shrink-0">
										<AvatarFallback className="bg-primary text-primary-foreground">
											<SparklesIcon className="size-4" />
										</AvatarFallback>
									</Avatar>
									<MessageContent className="max-w-none flex-1">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Loader size={16} />
											<span>Thinking...</span>
										</div>
									</MessageContent>
								</div>
							</Message>
						)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			{/* Input Area */}
			<div className="shrink-0 bg-background/80 p-4 backdrop-blur-sm">
				<div className="mx-auto w-full max-w-3xl">
					<PromptInput
						onSubmit={onSubmit}
						className="rounded-2xl border shadow-lg"
					>
						<PromptInputTextarea
							value={input}
							onValueChange={setInput}
							disabled={isStreaming}
							placeholder="Describe what you want to build..."
							className="min-h-[52px] rounded-2xl border-0 px-4 py-3"
						/>
						<PromptInputFooter className="justify-end px-3 pb-3">
							<PromptInputSubmit
								status={chatStatus}
								disabled={!input.trim()}
								className="rounded-xl"
							/>
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
		</div>
	);
}
