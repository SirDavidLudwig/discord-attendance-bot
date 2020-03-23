import Discord from "discord.js";

export function parseTime(time: string) {
	let [hour, min] = time.split(':').map(Number);
	let d = new Date();
	d.setHours(hour, min);
	return d;
}

export function parseDate(date: string, time: string) {
	return new Date(`${date} ${time}`);
}

/**
 * Parse a time range
 */
export function timeRange(range: string) {
	let [startH, startM, endH, endM] = range.split(/[\:\-]/).map(Number);
	let start = new Date();
	let end = new Date();
	start.setHours(startH, startM, 0, 0);
	end.setHours(endH, endM, 0, 0);
	return [start.getTime(), end.getTime()];
}

export function inRange(value: any, start: any, end: any) {
	return start <= value && value <= end;
}

export function commandArgs(value: string) {
	return value.trim().toLowerCase().split(/\s+/).slice(1);
}

/**
 * Get the list of classes the user is in from their roles
 */
export function getClasses(user: Discord.GuildMember) {
	let matches: RegExpMatchArray | null;
	let classes: string[] = []
	for (let role of user.roles.cache) {
		if (matches = role[1].name.match(/CSCI\s(\d+)\s(\d+)/)) {
			classes.push(`${matches[1]}-${matches[2]}`);
		}
	}
	return classes;
}

export function formatDate(date: Date, delim: string = '/') {
	return `${date.getMonth() + 1}${delim}${date.getDate()}${delim}${date.getFullYear()}`;
}

export function formatTime(date: Date) {
	let minutes = `${date.getMinutes()}`;
	if (minutes.length < 2) {
		minutes = `0${minutes}`;
	}
	return `${date.getHours()}:${minutes}`;
}
