import jsonfile from "jsonfile"
import { parseTimeRange, inRange, millisecondsInDay } from "./util";

/**
 * Raw schedule JSON information
 */
interface ISchedulesRaw {
	[course: string]: {
		[code: string]: {
			[days: string]: string;
		}
	}
};

/**
 * Schedule information
 */
export interface ISchedule {
	course: string;
	code  : string;
	days  : string;
	start : number;
	end   : number;
};

export interface ISchedules {
	[course: string]: ISchedule[];
};

export class ScheduleManager
{
	/**
	 * The list of schedules available
	 */
	private __schedules: ISchedules;

	/**
	 * Create the schedule manager
	 *
	 * @param {string} filename The list of files
	 */
	public constructor(fileName: string) {
		this.__schedules = this.parse(jsonfile.readFileSync(fileName));
	}

	/**
	 * Parse the given schedule JSON
	 *
	 * @param  {ISchedulesRaw} schedules The schedules to parse
	 * @return {ISchedule[]}
	 */
	protected parse(json: ISchedulesRaw) {
		let schedules: ISchedules = {};
		for (let course in json) {
			schedules[course] = [];
			for (let code in json[course]) {
				for (let days in json[course][code]) {
					let [start, end] = parseTimeRange(json[course][code][days]);
					schedules[course].push({course, code, days, start, end});
				}
			}
		}
		return schedules;
	}

	/**
	 * Find all classes active at the given time
	 *
	 * @param {number} time The current time in milliseconds
	 */
	public find(time: number, course: string) {
		let day = "UMTWRFS"[new Date(time).getDay()];
		let ms = millisecondsInDay(time);
		for (let schedule of this.__schedules[course]) {
			if (schedule.days.indexOf(day) != -1 && inRange(ms, schedule.start, schedule.end)) {
				return schedule;
			}
		}
		return null;
	}

	/**
	 * Get the complete list of courses available
	 *
	 * @return {string[]}
	 */
	public courses() {
		return Object.keys(this.__schedules);
	}
}
