import * as vscode from "vscode";
import type { Bookmark } from "./types";
import axios from "axios";
import { API_BASE_URL } from "./constants";
import { QotdPanel } from "./QotdPanel";
import { StateManager } from "./StateManager";

const progressBar = async function (fn: Function): Promise<void> {
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			cancellable: false,
			title: "Syncing",
		},
		async (progress) => {
			// progress.report({ increment: 0 });
			return new Promise(async (res, rej) => {
				try {
					await fn();
					res(0);
				} catch (error) {
					rej(error);
				}
			});
			// progress.report({ increment: 100 });
		}
	);
};

export const bookmarkHelper = {
	upsert: async function (accessToken: string, bookmark: TreeItem) {
		await progressBar(async () => {
			let response: any = await axios.put(
				`${API_BASE_URL}/bookmarks/${bookmark.id}`,
				{
					caption: bookmark.label,
				},
				{
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
				}
			);
			const { message } = response.data;
			vscode.window.showInformationMessage(message);
		});
	},
	remove: async function (accessToken: string, bookmarkId: string) {
		await progressBar(async () => {
			let response: any = await axios.delete(`${API_BASE_URL}/bookmarks/${bookmarkId}`, {
				headers: {
					authorization: `Bearer ${accessToken}`,
				},
			});
			const { message } = response.data;
			vscode.window.showInformationMessage(message);
		});
	},
};

export async function showInputBox(label: string) {
	const result = await vscode.window.showInputBox({
		value: label,
		// valueSelection: [2, 4],
		validateInput: (value: string) => {
			if (value) {
				return null;
			}
			return "Please give a caption to bookmark this question";
		},
		prompt: "Edit caption for bookmark",
	});
	return result || label || "Missing Caption";
}

export class BookmarkProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	private bookmarks: TreeItem[];

	constructor(accessToken: string) {
		this.bookmarks = [];
		vscode.window.registerTreeDataProvider("quizifer.sidebar.bookmark", this);
		vscode.commands.getCommands(true).then((commands) => {
			if (!commands.includes("quizifer.bookmark.refresh")) {
				vscode.commands.registerCommand("quizifer.bookmark.refresh", async () => await this.refresh());
			}
			if (!commands.includes("quizifer.bookmark.delete")) {
				vscode.commands.registerCommand("quizifer.bookmark.delete", async (data) => {
					await this.removeBookmark(accessToken, data.id);
				});
			}
			if (!commands.includes("quizifer.bookmark.edit")) {
				vscode.commands.registerCommand("quizifer.bookmark.edit", async (data: TreeItem) => {
					await this.upsertBookmark(accessToken, { _id: `${data.id}`, caption: `${data.label}` }, "bookmark");
				});
			}
		});
	}

	async initBookmarks(bookmarksData: Array<Bookmark>) {
		this.bookmarks = bookmarksData.map((bookmark) => new TreeItem(bookmark));
		await this.refresh();
	}
	getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
		if (element === undefined) {
			return this.bookmarks;
		}
		return element.children;
	}

	async refresh(): Promise<void> {
		this._onDidChangeTreeData.fire();
		await StateManager.setState("bookmarkTreeItems", this.bookmarks);
	}

	async onlogout(): Promise<void> {
		this.bookmarks = [];
		await this.refresh();
		QotdPanel.callQotdPanelListener("syncBookmarkState", { bookmarkTreeItems: StateManager.getState("bookmarkTreeItems") });
	}

	async upsertBookmark(accessToken: string, bookmark: Bookmark, source: string): Promise<void> {
		try {
			// Get edited caption
			if (source === "bookmark") {
				const result = await showInputBox(bookmark.caption);
				// Dont do anything if caption is same after edit
				if (bookmark.caption === result) {
					return;
				}
				// upsert on server
				bookmark.caption = result;
			}
			const bookmarkItem = new TreeItem(bookmark);
			await bookmarkHelper.upsert(accessToken, bookmarkItem);

			// upsert on extension.
			let upsert = false;
			this.bookmarks = this.bookmarks.map((bookmarkObj) => {
				if (bookmarkObj.id === bookmarkItem.id) {
					upsert = true;
					bookmarkObj = bookmarkItem;
				}
				return bookmarkObj;
			});
			if (!upsert) {
				this.bookmarks = [...this.bookmarks, bookmarkItem];
			}
			// Refresh extension bookmark panel
			await this.refresh();
		} catch (error) {
			console.error(`BookmarkProvider: upsertBookmark: ${error.stack ? error.stack : error}`);
			vscode.window.showErrorMessage(error.message);
		}
		// Sync bookmark array instance of QotdPanel.
		QotdPanel.callQotdPanelListener("syncBookmarkState", { bookmarkTreeItems: StateManager.getState("bookmarkTreeItems") });
	}

	async removeBookmark(accessToken: string, _id: string): Promise<void> {
		try {
			// Delete from server
			await bookmarkHelper.remove(accessToken, _id);
			// Delete from extension
			this.bookmarks = this.bookmarks.filter((bookmark) => bookmark.id !== _id);
			// Refresh extension bookmmark panel
			await this.refresh();
		} catch (error) {
			console.error(`BookmarkProvider: remove: ${error.stack ? error.stack : error}`);
			vscode.window.showErrorMessage(error.message);
		}
		// Sync bookmark array instance of QotdPanel.
		QotdPanel.callQotdPanelListener("syncBookmarkState", { bookmarkTreeItems: StateManager.getState("bookmarkTreeItems") });
	}
}

class TreeItem extends vscode.TreeItem {
	children: TreeItem[] | undefined;

	constructor(bookmark: Bookmark, children?: TreeItem[]) {
		super(bookmark.caption || "caption-missing", children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
		this.command = {
			command: "quizifer.qotd",
			title: bookmark.caption || "caption-missing",
			arguments: [bookmark],
		};
		this.id = bookmark._id;
		this.iconPath = new vscode.ThemeIcon("debug-breakpoint-unverified");
		// this.iconPath = new vscode.ThemeIcon("notebook-render-output");
		// this.contextValue = valueNode.type;
		this.children = children;
	}
}
