import {DateTime} from "luxon";

const formatDateTime = 'yyyy-MM-dd HH:mm:ss.SSS';

export const getDateTimeFormated = (dateTime: Date) => {
    return DateTime.fromJSDate(dateTime, {zone: 'UTC'}).toFormat(formatDateTime);
}