<script lang="ts">
	import { onMount } from "svelte";
	let loading = true;
	let responseData: string;
	let errorMessage: string;
	let upvotes: number;
	let downvotes: number;
	interface Locals {
		accessToken: string | undefined;
		bookmark: boolean;
	}

	let locals: Locals;
	const bookmarkListener = async (): Promise<void> => {
		if (!locals.accessToken) {
			tsvscode.postMessage({ type: "onError", value: "Please Login to bookmark a question" });
			tsvscode.postMessage({ type: "openSideBar", value: undefined });
			return;
		}
		updateLocals({ bookmark: !locals.bookmark });
	};

	const updateLocals = (value: object) => {
		locals = { ...locals, ...value };
		return;
	};
	onMount(async () => {
		window.addEventListener("message", async (event) => {
			const message = event.data;
			switch (message.type) {
				case "on-load":
					try {
						const options = message.value;
						locals = { ...locals, ...{ accessToken: options.accessToken } };

						const response: any = await fetch(`${API_BASE_URL}/qotd?${new URLSearchParams(options)}`);
						responseData = await response.text();
						upvotes = 0;
						downvotes = 0;
						updateLocals({ bookmark: false });
					} catch (error) {
						console.error(error);
						errorMessage = error.message ? error.message : error;
					}
					loading = false;
					return;
				case "updateLocals":
					return updateLocals(message.value);
			}
		});
	});
</script>

{#if loading}<style>
		body {
			background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='575' height='6px'%3E %3Cstyle%3E circle { animation: ball 2.5s cubic-bezier(0.000, 1.000, 1.000, 0.000) infinite; fill: %23bbb; } %23balls { animation: balls 2.5s linear infinite; } %23circle2 { animation-delay: 0.1s; } %23circle3 { animation-delay: 0.2s; } %23circle4 { animation-delay: 0.3s; } %23circle5 { animation-delay: 0.4s; } @keyframes ball { from { transform: none; } 20% { transform: none; } 80% { transform: translateX(864px); } to { transform: translateX(864px); } } @keyframes balls { from { transform: translateX(-40px); } to { transform: translateX(30px); } } %3C/style%3E %3Cg id='balls'%3E %3Ccircle class='circle' id='circle1' cx='-115' cy='3' r='3'/%3E %3Ccircle class='circle' id='circle2' cx='-130' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle3' cx='-145' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle4' cx='-160' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle5' cx='-175' cy='3' r='3' /%3E %3C/g%3E %3C/svg%3E") 50% no-repeat;
			height: 200px;
		}
	</style>{:else if responseData}
	<div class="container">
		<div class="bookmark">
			<div class="metric-container">
				<button
					on:click={() => {
						upvotes = upvotes + 1;
					}}>Upvote</button
				>
				<p>{upvotes}</p>
			</div>

			<div class="metric-container">
				<button
					on:click={() => {
						downvotes = downvotes + 1;
					}}>Downvote</button
				>
				<p>{downvotes}</p>
			</div>

			<div class="metric-container">
				<button on:click={bookmarkListener}>Bookmark</button>
				<p>{locals.bookmark}</p>
			</div>
		</div>
		<div class="question">
			{@html responseData}
		</div>
	</div>
{:else}
	<div>Error: {errorMessage}</div>
{/if}

<style>
	.bookmark {
		display: flex;
		flex-direction: column;
	}
	.question {
		display: block;
	}
	.metric-container {
		display: flex;
		margin: 10px;
	}
	.container {
		display: flex;
		margin: 30px;
		padding: 30px;
		background: var(--vscode-sideBar-background);
		box-shadow: 0px 13px 31px rgba(12, 20, 33, 0.04), 0px 9.45547px 20.8947px rgba(12, 20, 33, 0.032375), 0px 6.58125px 13.5141px rgba(12, 20, 33, 0.027), 0px 4.31641px 8.38574px rgba(12, 20, 33, 0.023125), 0px 2.6px 5.0375px rgba(12, 20, 33, 0.02), 0px 1.37109px 2.99707px rgba(12, 20, 33, 0.016875), 0px 0.56875px 1.79219px rgba(12, 20, 33, 0.013);
		border-radius: 1.25rem;
	}

	body {
		font-family: var(--vscode-editor-font-family);
		font-size: var(--vscode-editor-font-size);
		font-weight: var(--vscode-editor-font-weight);
	}
	pre {
		padding: 1rem !important;
		border-radius: 5px;
	}
	code {
		display: inline !important;
		/* padding: 0 0.5rem !important; */
		border-radius: 2px;
	}
</style>
