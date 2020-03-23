import * as Discord from "discord.js";
import dotenv from "dotenv";
import jsonfile from "jsonfile"
import { RosterManager } from "./roster";
import { ScheduleManager, ISchedule } from "./schedule";
import { commandArgs, formatDate, formatTime } from "./util";

const ACCOUNTS_FILE  = "data/accounts.json";
const SCHEDULES_FILE = "data/schedules.json";

/**
 * Map the Discord account to a Pipeline ID
 */
interface IAccounts {
	[discordId: string]: string;
};

/**
 * Load the environment configuration
 */
dotenv.config();

/**
 * Create the schedule manager
 */
const schedules = new ScheduleManager(SCHEDULES_FILE);

/**
 * Create the roster manager
 */
const rosters = new RosterManager(schedules.courses());

/**
 * The map of Discord IDs to Pipeline IDs
 */
const accounts: IAccounts = jsonfile.readFileSync(ACCOUNTS_FILE);

function updateAccount(user: Discord.GuildMember, pipelineId: string) {
	accounts[user.id] = pipelineId;
	jsonfile.writeFileSync(ACCOUNTS_FILE, accounts);
}

function register(user: Discord.GuildMember, msg: Discord.Message) {
	let [pipeline, course] = commandArgs(msg.content);

}

/**
 * Mark a user for attendance
 */
function attend(user: Discord.GuildMember, msg: Discord.Message) {
	let schedule: ISchedule | null;
	let pipeline = commandArgs(msg.content)[0];
	let time = Date.now();
	if (accounts[user.id] == undefined) {
		if (pipeline) {
			updateAccount(user, pipeline);
			msg.reply("I now know who you are. You no longer need to specify your Pipeline ID in the future when running `!attend`");
		} else {
			msg.reply("Who are you? Re-run with `!attend your-pipeline-id`");
			return;
		}
	}
	if (schedule = rosters.attend(accounts[user.id], time, schedules)) {
		let date = new Date(time);
		msg.reply(`Successfully attended ${schedule.course} ${schedule.code} on ${formatDate(date)} at ${formatTime(date)}.`);
	} else {
		msg.reply("No active class schedule found to attend.");
	}
}

/**
 * Create the Discord bot
 */
const client = new Discord.Client();
client.on('ready', () => {
	if (client.user) {
		console.log(`Logged in as ${client.user.tag}!`);
	}
});
client.on('message', msg => {
	if (msg.member) {
		if (msg.content.startsWith('!attend')) {
			attend(msg.member, msg);
		} else if (msg.content.startsWith("!register")) {
			register(msg.member, msg);
		}
	}
});
client.login(process.env["token"]);
