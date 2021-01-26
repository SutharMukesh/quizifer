import * as vscode from "vscode";
import type { Bookmark } from "./types";
export async function fetchBookmarks(accessToken: string) {
	return [
		{
			id: "12313124iu03913",
			caption: "Some caption 1",
		},
		{
			id: "12313124iu03913123",
			caption: "Some caption 2",
		},
		{
			id: "12313124iu039dasd13",
			caption: "Some caption 3",
		},
		{
			id: "12313124idsad",
			caption: "Some caption 4",
		},
		{
			id: "fdasfafaf",
			caption: "Some caption 5",
		},
	];
}
export class BookmarkProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	private bookmarks: TreeItem[];

	constructor(bookmarksData: Array<Bookmark>) {
		this.bookmarks = bookmarksData.map((bookmark) => new TreeItem(bookmark));
		vscode.window.registerTreeDataProvider("quizifer.sidebar.bookmark", this);
		vscode.commands.registerCommand("quizifer.bookmark.refresh", () => this.refresh());

		vscode.commands.registerCommand("quizifer.bookmark.delete", (data) => {
			vscode.window.showInformationMessage(`delete press for : ${data.label}`);
		});
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

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	onlogout(): void {
		this.bookmarks = [];
		this.refresh();
	}

	saveBookmark(bookmark: Bookmark): void {
		this.bookmarks.push(new TreeItem(bookmark));
		this.refresh();
	}
}

class TreeItem extends vscode.TreeItem {
	children: TreeItem[] | undefined;

	constructor(bookmark: Bookmark, children?: TreeItem[]) {
		super(bookmark.caption, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
		this.children = children;
	}
}
