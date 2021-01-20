<script lang="ts">
	import { onMount } from "svelte";
	// import type { User } from "../types";
	// import Todos from "./Todos.svelte";

	let loading = true;
	// let accessToken: string | null = null;
	let responseData: string;
	let errorMessage: string;
	// let user: User | null = null;
	onMount(async () => {
		window.addEventListener("message", async (event) => {
			const message = event.data;
			switch (message.type) {
				case "on-load":
					try {
						const options = message.value;
						const response: any = await fetch(`${API_BASE_URL}/qotd?${new URLSearchParams(options)}`);

						responseData = await response.text();

						// accessToken = message.value;
						// const response = await fetch(`${API_BASE_URL}/me`, {
						// 	headers: {
						// 		authorization: `Bearer ${accessToken}`,
						// 	},
						// });
						// console.log(response);
						// const data = await response.json();
						// console.log(data);
						// user = data.user;
					} catch (error) {
						console.error(error);
						errorMessage = error.message?error.message:error;
					}
					loading = false;
			}
		});
	});
</script>

<!-- {#if loading}
	<div>loading...</div>
{:else if user}
	<button on:click={() => {
		accessToken =""
		user = null
		tsvscode.postMessage({
				type: "logout",
				value: undefined,
			});
	}}>Logout</button>
{:else}
	<button
		on:click={() => {
			tsvscode.postMessage({
				type: "authenticate",
				value: undefined,
			});
		}}>Login with Github</button
	>
{/if} -->
{#if loading}
<style>
		body {
			background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='575' height='6px'%3E %3Cstyle%3E circle { animation: ball 2.5s cubic-bezier(0.000, 1.000, 1.000, 0.000) infinite; fill: %23bbb; } %23balls { animation: balls 2.5s linear infinite; } %23circle2 { animation-delay: 0.1s; } %23circle3 { animation-delay: 0.2s; } %23circle4 { animation-delay: 0.3s; } %23circle5 { animation-delay: 0.4s; } @keyframes ball { from { transform: none; } 20% { transform: none; } 80% { transform: translateX(864px); } to { transform: translateX(864px); } } @keyframes balls { from { transform: translateX(-40px); } to { transform: translateX(30px); } } %3C/style%3E %3Cg id='balls'%3E %3Ccircle class='circle' id='circle1' cx='-115' cy='3' r='3'/%3E %3Ccircle class='circle' id='circle2' cx='-130' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle3' cx='-145' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle4' cx='-160' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle5' cx='-175' cy='3' r='3' /%3E %3C/g%3E %3C/svg%3E") 50% no-repeat;
			height: 200px;
		}
</style>
{:else if responseData}
	{@html responseData}
{:else}
	<div>Error: {errorMessage}</div>
{/if}
