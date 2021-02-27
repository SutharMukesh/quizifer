<script lang="ts">
	import { onMount } from "svelte";
	import type { User } from "../types";

	let loading = true;
	let accessToken: string | null = null;
	let user: User | null = null;
	let errorMessage: string | null = null;

	function callProviderFunction(options: { type: string; value: any }) {
		console.log(`User: calling ${options.type}`);
		return tsvscode.postMessage(options);
	}

	onMount(async () => {
		window.addEventListener("message", async (event) => {
			const message = event.data;
			switch (message.type) {
				case "get-user-info":
					console.log("inside get-user-info");
					accessToken = message.value;
					try {
						const response = await fetch(`${API_BASE_URL}/me`, {
							headers: {
								authorization: `Bearer ${accessToken}`,
							},
						});
						console.log(response);
						user = await response.json();
						callProviderFunction({ type: "load-bookmarks", value: { accessToken, user } });
					} catch (error) {
						errorMessage = "Error fetching user info!";
						callProviderFunction({ type: "onError", value: error.message ? error.message : error });
					}
					loading = false;
					break;
				case "stop-loading":
					loading = false;
					break;
			}
		});
		callProviderFunction({ type: "get-token", value: undefined });
	});
</script>

{#if loading}
	<div>Please wait, Fetching info...</div>
{:else if errorMessage}
	<div>{errorMessage}</div>
{:else if user}
	<h3>{user.name}</h3>
	<button
		on:click={() => {
			accessToken = "";
			user = null;
			callProviderFunction({ type: "logout", value: undefined });
		}}>Logout</button
	>
{:else}
	<button
		on:click={() => {
			callProviderFunction({ type: "login", value: undefined });
			loading = true;
		}}>Login with Github</button
	>
{/if}
