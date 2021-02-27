import * as vscode from "vscode";
declare global {
	const tsvscode: {
		postMessage: ({ value: string, type: string }) => void;
	};
	const API_BASE_URL: string;
}
