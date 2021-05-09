<script lang="ts">
	import { onMount } from "svelte";
	import type { Bookmark } from "../../src/types";
	interface Locals {
		accessToken: string | undefined;
		bookmark: boolean;
		_id: string;
		title: string;
		question: string;
		loading: boolean;
		upvotes: number;
		downvotes: number;
		date: string; // YYYY/MM/DD
	}
	let quiziferLogo = quiziferLogoUri;
	const svg = {
		bookmarkOn: {
			d: "m17.52459,3.40993l-5.04914,0c-1.68017,-0.00002 -3.03446,-0.00005 -4.09959,0.14315c-1.10585,0.14868 -2.03695,0.46675 -2.77645,1.20625c-0.73949,0.7395 -1.05757,1.6706 -1.20624,2.77645c-0.1432,1.06512 -0.14319,2.41938 -0.14317,4.09953l0,8.53528c-0.00004,1.58068 -0.00006,2.87142 0.13934,3.8254c0.14024,0.95951 0.46606,1.9108 1.41657,2.37274c0.95051,0.46207 1.89986,0.13047 2.74099,-0.35211c0.83623,-0.47963 1.85112,-1.2771 3.09398,-2.25369l0.89224,-0.70102c0.7465,-0.58664 1.24309,-0.97487 1.65565,-1.22575c0.39118,-0.2381 0.61785,-0.29523 0.81123,-0.29523c0.19338,0 0.42005,0.05713 0.81123,0.29523c0.41255,0.25087 0.90914,0.6391 1.65562,1.22562l0.89231,0.70115c1.24282,0.97647 2.25775,1.77406 3.09391,2.25369c0.8412,0.48258 1.79052,0.81417 2.74106,0.35211c0.95042,-0.46194 1.27624,-1.41323 1.41654,-2.37274c0.13944,-0.95399 0.13932,-2.24472 0.13932,-3.8254l0,-8.53521c0,-1.68018 0,-3.03446 -0.14313,-4.09959c-0.14866,-1.10585 -0.46673,-2.03695 -1.20621,-2.77645c-0.7396,-0.7395 -1.67061,-1.05757 -2.77645,-1.20625c-1.06517,-0.1432 -2.41942,-0.14318 -4.09962,-0.14315z",
		},
		bookmarkOff: {
			d: "m 12.431413,3.2077747 h 5.137212 c 1.7095,-2.5e-5 3.087375,-5e-5 4.171125,0.14565 1.125125,0.151275 2.072375,0.4748875 2.824875,1.2272875 0.752375,0.7524 1.076,1.6997375 1.22725,2.824875 C 25.9375,8.4892997 25.9375,9.8672 25.9375,11.576687 v 8.684088 c 0,1.60825 1.25e-4,2.9215 -0.14175,3.892125 -0.14275,0.97625 -0.47425,1.944125 -1.44125,2.414125 -0.967125,0.470125 -1.933,0.13275 -2.788875,-0.35825 -0.85075,-0.488 -1.883375,-1.299375 -3.147875,-2.293 L 17.509875,23.2024 c -0.7595,-0.59675 -1.26475,-0.99175 -1.6845,-1.247 C 15.427375,21.71315 15.19675,21.655025 15,21.655025 c -0.19675,0 -0.427375,0.05813 -0.825375,0.300375 -0.41975,0.25525 -0.925,0.65025 -1.684525,1.247125 l -0.907737,0.713125 c -1.264563,0.993625 -2.2971879,1.805125 -3.1480123,2.293125 -0.8558,0.491 -1.8217125,0.828375 -2.7888,0.35825 -0.9670875,-0.47 -1.2985875,-1.437875 -1.441275,-2.414125 -0.14185,-0.970625 -0.1418125,-2.283875 -0.141775,-3.892125 v -8.684088 c -2.5e-5,-1.709487 -5e-5,-3.0873873 0.14565,-4.1710998 0.151275,-1.1251375 0.4749,-2.072475 1.2272875,-2.824875 0.7524,-0.7524 1.6997375,-1.0760125 2.824875,-1.2272875 1.0837119,-0.1457 2.4616118,-0.145675 4.1710998,-0.14565 z M 8.5101507,5.2117122 C 7.5929382,5.3350247 7.1072132,5.5605872 6.7612632,5.9065372 6.4153132,6.2524872 6.1897507,6.7382122 6.0664382,7.6554247 5.9394882,8.5996122 5.9375007,9.851 5.9375007,11.645275 v 8.5345 c 0,1.709 0.00245,2.8835 0.122075,3.701875 0.12115,0.829125 0.3173375,0.956125 0.4056125,0.999125 0.088275,0.04287 0.3094,0.118625 1.0361375,-0.298375 0.717475,-0.4115 1.6425244,-1.13525 2.9862993,-2.191125 L 11.375288,21.6939 C 12.079588,21.1404 12.673,20.67415 13.2,20.353525 c 0.559625,-0.340375 1.132125,-0.5735 1.8,-0.5735 0.667875,0 1.240375,0.233125 1.8,0.5735 0.527125,0.320625 1.1205,0.786875 1.82475,1.340375 l 0.887625,0.697375 c 1.34375,1.055875 2.268875,1.779625 2.98625,2.191125 0.72675,0.417 0.947875,0.34125 1.03625,0.298375 0.08825,-0.043 0.284375,-0.17 0.4055,-0.999125 C 24.06,23.063275 24.0625,21.888775 24.0625,20.179775 v -8.5345 C 24.0625,9.851 24.0605,8.5996122 23.933625,7.6554247 23.81025,6.7382122 23.58475,6.2524872 23.23875,5.9065372 22.89275,5.5605872 22.407125,5.3350247 21.489875,5.2117122 20.545625,5.0847622 19.29425,5.0827747 17.5,5.0827747 h -5 c -1.794262,0 -3.0456624,0.00199 -3.9898493,0.1289375 z",
		},
	};
	let locals: Locals;
	const QOTD_API_BASE_URL = `${API_BASE_URL}/qotd`;

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

		tsvscode.postMessage({ type: "upsertBookmark", value: { _id: locals._id, caption: locals.title, bookmark: !locals.bookmark, accessToken: locals.accessToken } });
		updateLocals({ bookmark: !locals.bookmark });
	};

	function syncBookmarkState(_id: string, bookmarkTreeItems: Array<Bookmark>) {
		tsvscode.postMessage({ type: "onDebug", value: "checking if qotd is bookmarked!" });
		if (bookmarkTreeItems.some((bookmarkTreeItem: any) => bookmarkTreeItem.id == _id)) {
			updateLocals({ bookmark: true });
		} else {
			updateLocals({ bookmark: false });
		}
	}

	function callProviderFunction(options: { type: string; value: any }) {
		return tsvscode.postMessage(options);
	}

	async function getQotd(options: { accessToken?: string; id?: string; date?: string } = {}): Promise<any> {
		const { accessToken, id, date } = options;
		callProviderFunction({ type: "onDebug", value: `GetQotd for ${date}` });
		// Set header for authorized Users
		let headers = {};
		if (accessToken) {
			headers = {
				authorization: `Bearer ${accessToken}`,
			};
		}

		let qotdApiUrl = QOTD_API_BASE_URL;
		if (date && accessToken) {
			qotdApiUrl += `?${new URLSearchParams({ date })}`;
		} else if (id) {
			qotdApiUrl += `?${new URLSearchParams({ id })}`;
		}

		const response = await fetch(qotdApiUrl, {
			headers,
		});

		const responseTxt = await response.text();
		// tsvscode.postMessage({ type: "onDebug", value: responseTxt });

		// Send JSON Parsed Response only in case of auth users
		if (accessToken) {
			const responseObj = JSON.parse(responseTxt);

			if (response.status !== 200) {
				throw new Error(`<h3>${responseObj.message ? responseObj.message : responseObj}</h3>`);
			}
			return responseObj;
		} else {
			// Send Response Txt in case of normal user
			if (response.status !== 200) {
				throw new Error(`<h3>${responseTxt}</h3>`);
			}
			return responseTxt;
		}
	}

	async function onClickLeft() {
		const { accessToken, date } = locals;

		if (!accessToken) {
			callProviderFunction({ type: "openSideBar", value: undefined });
			callProviderFunction({ type: "onError", value: "Please Login to get previous question." });
			return;
		}
		callProviderFunction({ type: "onDebug", value: `OnClickLeft date: ${date}` });
		const qotdDate = new Date(date);
		const yesterday = new Date(qotdDate);

		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayWithOffsetTimezoneFixed = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000);
		const dateToFetch = yesterdayWithOffsetTimezoneFixed.toISOString().split("T")[0].replaceAll("-", "/");

		callProviderFunction({ type: "onDebug", value: `OnClickLeft dateToFetch: ${dateToFetch}` });

		callProviderFunction({ type: "getQotdFromDate", value: { date: dateToFetch } });
	}

	async function onClickRight() {
		const { accessToken, date } = locals;

		if (!accessToken) {
			callProviderFunction({ type: "openSideBar", value: undefined });
			callProviderFunction({ type: "onError", value: "Please Login to get previous question." });
			return;
		}

		tsvscode.postMessage({ type: "onInfo", value: `date: ${date}` });
		const qotdDate = new Date(date);
		const today = new Date();
		const nextDate = new Date(qotdDate);
		nextDate.setDate(nextDate.getDate() + 1);

		if (nextDate > today) {
			return callProviderFunction({ type: "onError", value: "Sorry you have to wait till tomorrow." });
		}
		const nextDateWithOffsetTimezoneFixed = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000);
		const dateToFetch = nextDateWithOffsetTimezoneFixed.toISOString().split("T")[0].replaceAll("-", "/");
		tsvscode.postMessage({ type: "onInfo", value: dateToFetch });

		callProviderFunction({ type: "getQotdFromDate", value: { date: dateToFetch } });
	}

	onMount(async () => {
		window.addEventListener("message", async (event) => {
			const message = event.data;
			switch (message.type) {
				case "syncBookmarkState": {
					try {
						const { bookmarkTreeItems } = message.value;
						// Check if the current QOTD is present in updated bookmarkTreeItems.
						syncBookmarkState(locals._id, bookmarkTreeItems);
					} catch (error) {
						tsvscode.postMessage({ type: "onError", value: error.message ? error.message : error, stack: `Catch in syncBookmarkState: ${error.stack ? error.stack : error}` });
					}
					break;
				}

				case "get-qotd":
					try {
						const { accessToken, id, bookmarkTreeItems, date: dateToFetch } = message.value;
						locals = { ...locals, ...{ accessToken } };

						if (accessToken) {
							// for user that are Logged in
							tsvscode.postMessage({ type: "onDebug", value: "Getting qotd with an accessToken" });

							const { _id, question, title, date } = await getQotd({ accessToken, id, date: dateToFetch });

							updateLocals({ _id, question, title, date });

							// check current QOTD is present in bookmark.
							syncBookmarkState(_id, bookmarkTreeItems);
						} else {
							// for user that are not logged in
							tsvscode.postMessage({ type: "onDebug", value: "Getting qotd" });

							const responseTxt = await getQotd();

							updateLocals({ question: responseTxt, upvotes: 0, downvotes: 0, bookmark: false });
						}
					} catch (error) {
						updateLocals({ question: error.message ? error.message : error });
						tsvscode.postMessage({ type: "onError", value: error.message ? error.message : error, stack: `Catch in get-qotd: ${error.stack ? error.stack : error}` });
					}
					updateLocals({ loading: false });
					return;
				case "updateLocals":
					return updateLocals(message.value);
			}
		});
	});
</script>

<div class="container">
	<button class="go-left-container" on:click={onClickLeft}>Left</button>
	<div class="content-div">
		{#if locals.loading}
			<style>
				.content-div {
					width: 600px;
					background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='575' height='6px'%3E %3Cstyle%3E circle { animation: ball 2.5s cubic-bezier(0.000, 1.000, 1.000, 0.000) infinite; fill: %23bbb; } %23balls { animation: balls 2.5s linear infinite; } %23circle2 { animation-delay: 0.1s; } %23circle3 { animation-delay: 0.2s; } %23circle4 { animation-delay: 0.3s; } %23circle5 { animation-delay: 0.4s; } @keyframes ball { from { transform: none; } 20% { transform: none; } 80% { transform: translateX(864px); } to { transform: translateX(864px); } } @keyframes balls { from { transform: translateX(-40px); } to { transform: translateX(30px); } } %3C/style%3E %3Cg id='balls'%3E %3Ccircle class='circle' id='circle1' cx='-115' cy='3' r='3'/%3E %3Ccircle class='circle' id='circle2' cx='-130' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle3' cx='-145' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle4' cx='-160' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle5' cx='-175' cy='3' r='3' /%3E %3C/g%3E %3C/svg%3E") 50% no-repeat;
					height: 200px;
				}
			</style>{:else if locals.question}
			<div class="bookmark">
				<div class="metric-container">
					<svg on:click={bookmarkListener} class="bookmark-icon">
						<path d={locals.bookmark ? svg.bookmarkOn.d : svg.bookmarkOff.d} id="bookmark-svg" />
					</svg>
				</div>
			</div>
			<div class="question">
				{@html locals.question}
			</div>
		{:else}
			<div>Somethings Wrong!</div>
		{/if}
	</div>
	<button class="go-right-container" on:click={onClickRight}>Right</button>
</div>
<footer>
	<div class="logo-trademark">
		<p class="line">——————————————————————————————</p>
		<img src={quiziferLogo} alt="logo" class="logo-trademark-icon" />
		<p class="line">——————————————————————————————</p>
	</div>
</footer>
