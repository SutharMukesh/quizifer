<script lang="ts">
	import { onMount } from "svelte";
	import type { User } from "../types";

	let loading = true;
	let accessToken: string | null = null;
	let user: User | null = null;

	onMount(async () => {
		window.addEventListener("message", async (event) => {
			const message = event.data;
			switch (message.type) {
				case "token":
					accessToken = message.value;
					try {
						const response = await fetch(`${API_BASE_URL}/me`, {
							headers: {
								authorization: `Bearer ${accessToken}`,
							},
						});
						console.log(response);
						const data = await response.json();
						console.log(data);
						user = data.user;
					} catch (error) {
						tsvscode.postMessage({ type: "onError", value: error });
					}
					loading = false;
			}
		});
		tsvscode.postMessage({ type: "get-token", value: undefined });
	});
</script>

{#if loading}
	<div>loading...</div>
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
				type: "authenticate",
				value: undefined,
			});
		}}>Login with Github</button
	>
{/if}
