import axios from "axios";
import { API_BASE_URL } from "./constants";

export const statModule = {
	notified: async () => {
		await axios.put(`${API_BASE_URL}/stats/n`);
	},
	attempted: async () => {
		await axios.put(`${API_BASE_URL}/stats/a`);
	},
	ignored: async () => {
		await axios.put(`${API_BASE_URL}/stats/i`);
	},
};
