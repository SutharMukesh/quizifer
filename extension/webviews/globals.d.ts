import * as vscode from "vscode";
interface PostMessageOpts{
	value:any;
	type:any;
	stack?:string;
}
declare global {
	const tsvscode: {
		postMessage: (options:PostMessageOpts)=>void
	};
	const API_BASE_URL: string;
}
