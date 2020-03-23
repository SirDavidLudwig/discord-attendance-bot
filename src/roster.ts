import parse from "csv-parse/lib/sync";
import {readdirSync, readFileSync, writeFileSync} from "fs";
import { ISchedule, ScheduleManager } from "./schedule";
import { formatDate, parseDate, formatTime } from "./util";

interface IStudent {
	firstName : string;
	lastName  : string;
};

interface IRoster {
	pipelineIds: string[], // Used to preserve roster order
	info: {
		[pipelineId: string]: IStudent
	}
};

interface IRosters {
	[course: string]: IRoster;
};

interface IAttendanceRoster {
	[pipelineId: string]: Date;
};

interface IAttendance {
	[date: string]: {
		[course: string]: {
			[code: string]: IAttendanceRoster;
		};
	};
};

export class RosterManager
{
	private __rosters: IRosters;

	private __attendance: IAttendance;

	public constructor(courses: string[]) {
		this.__rosters = this.loadRosters(courses);
		this.__attendance = this.loadAttendanceRosters(new Date());
		setInterval(() => { this.unloadOutdatedAttendance(new Date()) }, 1000*60*60*24);
	}

	protected loadRosters(courses: string[]) {
		let rosters: IRosters = {};
		for (let course of courses) {
			rosters[course] = {
				pipelineIds: [],
				info: {}
			}
			for (let row of parse(readFileSync(`data/roster/${course}.csv`))) {
				rosters[course].pipelineIds.push(row[0]);
				rosters[course].info[row[0]] = {
					lastName: row[1],
					firstName: row[2]
				};
			}
		}
		return rosters;
	}

	protected loadAttendanceRosters(date: Date) {
		let day = formatDate(date, '-');
		let attendance: IAttendance = {[day]: {}};
		for (let file of readdirSync("data/attendance")) {
			let matches = file.match(/^([^\.]+)\.([^\.]+)\.([^\.]+).csv$/);
			if (matches && matches[3] == day) {
				if (!(matches[1] in attendance[day])) {
					attendance[day][matches[1]] = {};
				}
				attendance[day][matches[1]][matches[2]] = this.readAttendanceRoster(`data/attendance/${file}`, date);
			}
		}
		return attendance;
	}

	protected unloadOutdatedAttendance(date: Date) {
		let day = formatDate(date, '-');
		for (let date of Object.keys(this.__attendance)) {
			if (date != day) {
				delete this.__attendance[date];
			}
		}
	}

	protected readAttendanceRoster(fileName: string, date?: Date) {
		let day = formatDate(date || new Date(), '-');
		let roster: IAttendanceRoster = {};
		for (let row of parse(readFileSync(fileName))) {
			if (row[3].trim()) {
				roster[row[0]] = parseDate(day, row[3]);
			}
		}
		return roster;
	}

	protected writeAttendanceRoster(attendanceRoster: IAttendanceRoster, course: string,
		code: string, date?: Date)
	{
		let day = formatDate(date || new Date(), '-');
		let lines = [];
		let roster = this.__rosters[course];
		for (let pipelineId of this.__rosters[course].pipelineIds) {
			let firstName = roster.info[pipelineId].firstName;
			let lastName = roster.info[pipelineId].lastName;
			let time = '""';
			if (attendanceRoster[pipelineId]) {
				time = formatTime(attendanceRoster[pipelineId]);
			}
			lines.push(`${pipelineId},${lastName},${firstName},${time}`);
		}
		writeFileSync(`data/attendance/${course}.${code}.${day}.csv`, lines.join("\n"), "utf-8");
	}

	attendanceRoster(course: string, code: string, date: Date) {
		let day = formatDate(date, '-')
		if (!this.__attendance[day]) {
			this.__attendance[day] = {};
		}
		if (!this.__attendance[day][course]) {
			this.__attendance[day][course] = {};
		}
		if (!this.__attendance[day][course][code]) {
			this.__attendance[day][course][code] = {};
		}
		return this.__attendance[day][course][code];
	}

	public attend(pipelineId: string, time: number, scheduleManager: ScheduleManager) {
		let schedule: ISchedule | null;
		for (let course in this.__rosters) {
			if (pipelineId in this.__rosters[course].info) {
				if (schedule = scheduleManager.find(time, course)) {
					let date = new Date(time);
					let roster = this.attendanceRoster(course, schedule.code, date);
					roster[pipelineId] = date;
					this.writeAttendanceRoster(roster, course, schedule.code, date);
					return schedule;
				}
			}
		}
		return null;
	}
}
