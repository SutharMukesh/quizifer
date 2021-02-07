<script lang="ts">
	import { onMount } from "svelte";
	import type { Bookmark } from "../../src/types";
	interface Locals {
		accessToken: string | undefined;
		bookmark: boolean;
		_id: string;
		caption: string;
		question: string;
		loading: boolean;
		upvotes: number;
		downvotes: number;
	}

	let locals: Locals;
	const updateLocals = (value: object) => {
		locals = { ...locals, ...value };
		return;
	};

	// Start loading animation
	updateLocals({ loading: true });

	const bookmarkListener = async (): Promise<void> => {
		if (!locals.accessToken) {
			tsvscode.postMessage({ type: "onError", value: "Please Login to bookmark a question" });
			tsvscode.postMessage({ type: "openSideBar", value: undefined });
			return;
		}

		tsvscode.postMessage({ type: "updateBookmark", value: { _id: locals._id, caption: locals.caption, bookmark: !locals.bookmark, accessToken: locals.accessToken } });
		updateLocals({ bookmark: !locals.bookmark });
	};

	function syncBookmarkState(_id: string, bookmarkTreeItems: Array<Bookmark>) {
		if (bookmarkTreeItems.some((bookmarkTreeItem: any) => bookmarkTreeItem.id == _id)) {
			updateLocals({ bookmark: true });
		} else {
			updateLocals({ bookmark: false });
		}
	}

	onMount(async () => {
		window.addEventListener("message", async (event) => {
			const message = event.data;
			switch (message.type) {
				case "syncBookmarkState": {
					const { bookmarkTreeItems } = message.value;
					// Check if the current QOTD is present in updated bookmarkTreeItems.
					syncBookmarkState(locals._id, bookmarkTreeItems);
					break;
				}

				case "get-qotd":
					try {
						const { accessToken, id, bookmarkTreeItems } = message.value;
						locals = { ...locals, ...{ accessToken } };

						if (accessToken) {;
							// for user that are Logged in
							let response: any = await fetch(`${API_BASE_URL}/qotd?${id ? new URLSearchParams({ id }) : {}}`, {
								headers: {
									authorization: `Bearer ${accessToken}`,
								},
							});
							const responseObj = JSON.parse(await response.text());
							if (response.status !== 200) {
								return updateLocals({ question: `<h3>${responseObj.message}</h3>` });
							}
							const { _id, question, caption } = responseObj;
							updateLocals({ _id, question, caption });

							// check current QOTD is present in bookmark.
							syncBookmarkState(_id, bookmarkTreeItems);
						} else {
							// for user that are not logged in
							const response: any = await fetch(`${API_BASE_URL}/qotd`);
							updateLocals({ question: await response.text(), upvotes: 0, downvotes: 0, bookmark: false });
						}
					} catch (error) {
						tsvscode.postMessage({ type: "onError", value: error.stack });
					}
					updateLocals({ loading: false });
					return;
				case "updateLocals":
					return updateLocals(message.value);
			}
		});
	});
</script>

{#if locals.loading}<style>
		body {
			background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='575' height='6px'%3E %3Cstyle%3E circle { animation: ball 2.5s cubic-bezier(0.000, 1.000, 1.000, 0.000) infinite; fill: %23bbb; } %23balls { animation: balls 2.5s linear infinite; } %23circle2 { animation-delay: 0.1s; } %23circle3 { animation-delay: 0.2s; } %23circle4 { animation-delay: 0.3s; } %23circle5 { animation-delay: 0.4s; } @keyframes ball { from { transform: none; } 20% { transform: none; } 80% { transform: translateX(864px); } to { transform: translateX(864px); } } @keyframes balls { from { transform: translateX(-40px); } to { transform: translateX(30px); } } %3C/style%3E %3Cg id='balls'%3E %3Ccircle class='circle' id='circle1' cx='-115' cy='3' r='3'/%3E %3Ccircle class='circle' id='circle2' cx='-130' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle3' cx='-145' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle4' cx='-160' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle5' cx='-175' cy='3' r='3' /%3E %3C/g%3E %3C/svg%3E") 50% no-repeat;
			height: 200px;
		}
	</style>{:else if locals.question}
	<div class="container">
		<div class="bookmark">
			<div class="metric-container">
				<button
					on:click={() => {
						updateLocals({ upvotes: locals.upvotes + 1 });
					}}>Upvote</button
				>
				<p>{locals.upvotes}</p>
			</div>

			<div class="metric-container">
				<button
					on:click={() => {
						updateLocals({ downvotes: locals.downvotes + 1 });
					}}>Downvote</button
				>
				<p>{locals.downvotes}</p>
			</div>

			<div class="metric-container">
				<button on:click={bookmarkListener}>Bookmark</button>
				<p>{locals.bookmark}</p>
			</div>
		</div>
		<div class="question">
			{@html locals.question}
		</div>
	</div>
{:else}
	<div>Somethings Wrong!</div>
{/if}
