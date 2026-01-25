import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { OAuthConsentCard } from "@/components/oauth/consent-card";

export const metadata: Metadata = {
	title: "Authorize Application",
};

type SearchParams = Promise<{
	client_id?: string;
	redirect_uri?: string;
	response_type?: string;
	scope?: string;
	state?: string;
	code_challenge?: string;
	code_challenge_method?: string;
}>;

type OAuthAuthorizePageProps = {
	searchParams: SearchParams;
};

export default async function OAuthAuthorizePage({
	searchParams,
}: OAuthAuthorizePageProps): Promise<React.JSX.Element> {
	const params = await searchParams;
	const {
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: responseType,
		scope,
		state,
		code_challenge: codeChallenge,
		code_challenge_method: codeChallengeMethod,
	} = params;

	// Validate required parameters
	const missingParams: string[] = [];

	if (!clientId) missingParams.push("client_id");
	if (!redirectUri) missingParams.push("redirect_uri");
	if (!responseType) missingParams.push("response_type");
	if (!codeChallenge) missingParams.push("code_challenge");
	if (!codeChallengeMethod) missingParams.push("code_challenge_method");

	if (missingParams.length > 0) {
		// If we have a redirect_uri, redirect with error
		if (redirectUri) {
			const errorUrl = new URL(redirectUri);
			errorUrl.searchParams.set("error", "invalid_request");
			errorUrl.searchParams.set(
				"error_description",
				`Missing required parameters: ${missingParams.join(", ")}`,
			);
			if (state) errorUrl.searchParams.set("state", state);
			redirect(errorUrl.toString());
		}

		// Otherwise show error page
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
					<h1 className="mb-2 font-semibold text-lg">Invalid Request</h1>
					<p className="text-muted-foreground text-sm">
						Missing required parameters: {missingParams.join(", ")}
					</p>
				</div>
			</div>
		);
	}

	// Validate response_type
	if (responseType !== "code") {
		if (redirectUri) {
			const errorUrl = new URL(redirectUri);
			errorUrl.searchParams.set("error", "unsupported_response_type");
			errorUrl.searchParams.set(
				"error_description",
				"Only response_type=code is supported",
			);
			if (state) errorUrl.searchParams.set("state", state);
			redirect(errorUrl.toString());
		}

		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
					<h1 className="mb-2 font-semibold text-lg">Unsupported Response Type</h1>
					<p className="text-muted-foreground text-sm">
						Only response_type=code is supported
					</p>
				</div>
			</div>
		);
	}

	// Validate code_challenge_method
	if (codeChallengeMethod !== "S256") {
		if (redirectUri) {
			const errorUrl = new URL(redirectUri);
			errorUrl.searchParams.set("error", "invalid_request");
			errorUrl.searchParams.set(
				"error_description",
				"Only code_challenge_method=S256 is supported",
			);
			if (state) errorUrl.searchParams.set("state", state);
			redirect(errorUrl.toString());
		}

		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
					<h1 className="mb-2 font-semibold text-lg">Invalid Code Challenge Method</h1>
					<p className="text-muted-foreground text-sm">
						Only S256 code challenge method is supported
					</p>
				</div>
			</div>
		);
	}

	// All validations passed, render the consent card
	return (
		<OAuthConsentCard
			clientId={clientId}
			redirectUri={redirectUri}
			scope={scope ?? "mcp:access"}
			state={state}
			codeChallenge={codeChallenge}
			codeChallengeMethod={codeChallengeMethod}
		/>
	);
}
