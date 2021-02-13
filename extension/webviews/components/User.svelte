<script lang="ts">
	import { onMount } from "svelte";
	import type { User } from "../types";

	let loading = true;
	let accessToken: string | null = null;
	let user: User | null = null;
	let errorMessage: string | null = null;
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
						tsvscode.postMessage({ type: "load-bookmarks", value: { accessToken, user } });
					} catch (error) {
						errorMessage = "Error fetching user info!";
						tsvscode.postMessage({ type: "onError", value: error.message ? error.message : error });
					}
					loading = false;
					break;
				case "stop-loading":
					loading = false;
					break;
			}
		});
		console.log("calling get-token");
		tsvscode.postMessage({ type: "get-token", value: undefined });
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
			tsvscode.postMessage({
				type: "logout",
				value: undefined,
			});
		}}>Logout</button
	>
{:else}
	<button
		on:click={() => {
			tsvscode.postMessage({
				type: "login",
				value: undefined,
			});
			loading = true;
		}}>Login with Github</button
	>
{/if}
<pre id="ascii">
█▀█ █░█ █ ▀█ █ █▀▀ █▀▀ █▀█
▀▀█ █▄█ █ █▄ █ █▀░ ██▄ █▀▄
</pre>
