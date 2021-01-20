import * as vscode from "vscode";

export class StateManager {
	static globalState: vscode.Memento;

	static setState(key: string, value: string | null) {
		return this.globalState.update(key, value);
	}

	static getState(key: string): string | undefined {
		return this.globalState.get(key);
	}
}
