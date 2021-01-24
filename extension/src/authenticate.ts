import * as constants from "./constants";
import * as vscode from "vscode";
import * as polka from "polka";
import { StateManager } from "./StateManager";

export function authenticate(fn: () => void) {
	const app = polka();

	app.get("/auth/:token", async (req, res) => {
		const { token } = req.params;
		if (!token) {
			res.end(`<h1>Something went wrong</h1>`);
			return;
		}

		await StateManager.setState("accessToken", token);
		fn();
		res.end(`<h1>Auth was Successfull, you can close this window</h1>`);

		app.server?.close();
	});

	app.listen(54321, (err: Error) => {
		if (err) {
			vscode.window.showErrorMessage(err.message);
		}
		console.log("Server Started");
		vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`${constants.API_BASE_URL}/auth/github`));
	});
}
