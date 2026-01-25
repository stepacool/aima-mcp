"use client";

import { CheckCircle, ExternalLink, Shield, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";

type OAuthConsentCardProps = {
	clientId: string;
	redirectUri: string;
	scope: string;
	state?: string;
	codeChallenge: string;
	codeChallengeMethod: string;
};

type ClientInfo = {
	clientId: string;
	clientName: string;
	redirectUris: string[];
	scopes: string[];
	serverId: string;
};

export function OAuthConsentCard({
	clientId,
	redirectUri,
	scope,
	state,
	codeChallenge,
	codeChallengeMethod,
}: OAuthConsentCardProps): React.JSX.Element {
	const router = useRouter();
	const { user, loaded: sessionLoaded } = useSession();
	const [clientInfo, setClientInfo] = React.useState<ClientInfo | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isAuthorizing, setIsAuthorizing] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	// Redirect to sign-in if not authenticated
	React.useEffect(() => {
		if (sessionLoaded && !user) {
			const currentUrl = new URL(window.location.href);
			const redirectTo = currentUrl.pathname + currentUrl.search;
			router.push(`/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
		}
	}, [sessionLoaded, user, router]);

	// Fetch client info
	React.useEffect(() => {
		async function fetchClientInfo() {
			try {
				const backendUrl =
					process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";
				const response = await fetch(`${backendUrl}/oauth/client/${clientId}`);
				if (!response.ok) {
					if (response.status === 404) {
						setError("Unknown application. The client_id is not registered.");
					} else {
						setError("Failed to load application information.");
					}
					return;
				}
				const data = await response.json();
				setClientInfo({
					clientId: data.client_id,
					clientName: data.client_name,
					redirectUris: data.redirect_uris,
					scopes: data.scopes,
					serverId: data.server_id,
				});
			} catch (e) {
				setError("Failed to connect to authorization server.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchClientInfo();
	}, [clientId]);

	// Validate redirect URI against registered URIs
	const isRedirectUriValid = React.useMemo(() => {
		if (!clientInfo) return false;
		return clientInfo.redirectUris.includes(redirectUri);
	}, [clientInfo, redirectUri]);

	const handleAllow = async () => {
		if (!user || !clientInfo) return;

		setIsAuthorizing(true);
		setError(null);

		try {
			const response = await fetch("/api/oauth/authorize/create-code", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					clientId,
					userId: user.id,
					redirectUri,
					scope,
					codeChallenge,
					codeChallengeMethod,
					state,
					serverId: clientInfo.serverId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error_description || "Authorization failed");
			}

			const data = await response.json();
			const code = data.code;

			// Redirect to the client with the authorization code
			const callbackUrl = new URL(redirectUri);
			callbackUrl.searchParams.set("code", code);
			if (state) callbackUrl.searchParams.set("state", state);

			// Use window.location for external redirect
			window.location.href = callbackUrl.toString();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Authorization failed");
			setIsAuthorizing(false);
		}
	};

	const handleDeny = () => {
		// Redirect to the client with error
		const callbackUrl = new URL(redirectUri);
		callbackUrl.searchParams.set("error", "access_denied");
		callbackUrl.searchParams.set(
			"error_description",
			"The user denied the authorization request",
		);
		if (state) callbackUrl.searchParams.set("state", state);

		window.location.href = callbackUrl.toString();
	};

	// Loading state
	if (!sessionLoaded || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4">
							<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							<p className="text-muted-foreground text-sm">
								Loading authorization request...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Not signed in - will redirect
	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4">
							<p className="text-muted-foreground text-sm">
								Redirecting to sign in...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Error state
	if (error && !clientInfo) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<XCircle className="size-5" />
							Authorization Error
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">{error}</p>
					</CardContent>
					<CardFooter>
						<Link href="/dashboard" className="w-full">
							<Button variant="outline" className="w-full">
								Return to Dashboard
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// Invalid redirect URI
	if (clientInfo && !isRedirectUriValid) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<XCircle className="size-5" />
							Invalid Redirect URI
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							The redirect URI provided is not registered for this application.
						</p>
					</CardContent>
					<CardFooter>
						<Link href="/dashboard" className="w-full">
							<Button variant="outline" className="w-full">
								Return to Dashboard
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// Consent form
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
						<Shield className="size-8 text-primary" />
					</div>
					<CardTitle className="text-xl">Authorize Application</CardTitle>
					<CardDescription>
						<span className="font-medium text-foreground">
							{clientInfo?.clientName}
						</span>{" "}
						is requesting access to your account
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* User info */}
					<div className="rounded-lg bg-muted/50 p-3">
						<p className="text-muted-foreground text-sm">
							Signed in as{" "}
							<span className="font-medium text-foreground">{user.email}</span>
						</p>
					</div>

					{/* Requested permissions */}
					<div>
						<h3 className="mb-2 font-medium text-sm">
							This application will be able to:
						</h3>
						<ul className="space-y-2">
							{scope.split(" ").map((s) => (
								<li key={s} className="flex items-center gap-2 text-sm">
									<CheckCircle className="size-4 text-green-500" />
									{s === "mcp:access"
										? "Access MCP servers on your behalf"
										: s}
								</li>
							))}
						</ul>
					</div>

					{/* Redirect info */}
					<div className="rounded-lg border bg-muted/30 p-3">
						<p className="flex items-center gap-1 text-muted-foreground text-xs">
							<ExternalLink className="size-3" />
							Will redirect to:{" "}
							<span className="truncate font-mono">
								{new URL(redirectUri).origin}
							</span>
						</p>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
				</CardContent>

				<CardFooter className="flex gap-3">
					<Button
						variant="outline"
						className="flex-1"
						onClick={handleDeny}
						disabled={isAuthorizing}
					>
						Deny
					</Button>
					<Button
						className="flex-1"
						onClick={handleAllow}
						disabled={isAuthorizing}
					>
						{isAuthorizing ? "Authorizing..." : "Allow"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
