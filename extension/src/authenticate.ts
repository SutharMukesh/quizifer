import * as constants from "./constants";
import * as vscode from "vscode";
import * as polka from "polka";
import { StateManager } from "./StateManager";
import { getLogger } from "./logger";

export function authenticate(fn: () => void) {
	const logger = getLogger("authenticate");
	const app = polka();
	app.get("/auth/:token", async (req, res) => {
		logger.info(`Auth route /auth/:token called`);
		const { token } = req.params;
		if (!token) {
			res.end(`<h3>Something went wrong</h3>`);
			return;
		}

		await StateManager.setState("accessToken", token);
		fn();
		res.end(`<!doctype html>
		<html lang="en">
		  <head>
			<meta charset="utf-8">
			<meta
			  http-equiv="Content-Security-Policy"
			  content="default-src vscode-resource:; form-action vscode-resource:; frame-ancestors vscode-resource:; img-src vscode-resource: https:; script-src 'self' 'unsafe-inline' vscode-resource:; style-src 'self' 'unsafe-inline' vscode-resource:;"
			/>
			<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		  </head>
		  <body>
			  <h1>Login success!</h1>
			  <h2>You can now close this tab.</h2>
			  <style>
				html, body {
				  background-color: #1a1a1a;
				  color: #c3c3c3;
				  display: flex;
				  flex-direction: column;
				  justify-content: center;
				  align-items: center;
				  height: 100%;
				  width: 100%;
				  margin: 0;
				}
			  </style>
		  </body>
		</html>`);

		app.server?.close();
	});

	app.listen(54321, (err: Error) => {
		if (err) {
			vscode.window.showErrorMessage(err.message);
		}
		logger.info("Server Started");
		vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`${constants.API_BASE_URL}/auth/github`));
	});
}
