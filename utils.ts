import { Data } from "./types.ts";
import * as formula from 'npm:@formulajs/formulajs@4.4.5';

export function readCSVFile<T>(d: string): Array<T> {

    const splittedLines = d.split("\n");
    const labels = splittedLines[0].split(";");

    const data = [];

    for (const line of splittedLines) {
        if (line.includes("COMPANY_ID")) continue;

        const values = line.split(";");

        // @ts-ignore - Its fine
        let object: T = {};

        labels.forEach((label, index) => {

            if (label.includes("\r")) {
                label = label.replace("\r", '');
            }

            if (values[index].includes("\r")) {
                values[index] = values[index].replace("\r", '');
            }

            values[index] = values[index].trim();

            if (label.includes("UMP")) {
                if (values[index].includes("-")) {
                    // @ts-ignore - Its fine
                    values[index] = 0;
                } else {
                    // @ts-ignore - Its fine
                    values[index] = Number(values[index].replaceAll(".", ""));
                }
            }

            object = {
                ...object,
                [label]: values[index]
            }
        });

        data.push(object);
    }

    return data;

}

// a and b are javascript Date objects
export function dateDiffInDays(startDate: Date, endDate: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const utc2 = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export function toDate(date: string) {
    return new Date(date);
}

export function isBelowMarch2022(date: Date) {
    const march2022 = new Date(2022, 2, 1);
    return date < march2022;
}

// Rp 5 Juta
// const SALARY = 5000000;

export function getDiffMonthAndCompensation(startDate: Date, endDate: Date, ump: number) {

    const diffMonth: number = Math.max(0, formula.ROUND(dateDiffInDays(startDate, endDate) / 30, 0));
    const compensation: number = Number((((diffMonth / 12) * ump) / 2).toFixed(0));

    return {
        diffMonth,
        compensation
    }

}

export function calculation2022(data: Data) {

    let startDate = toDate(data.JOIN_DATE);
    let endDate = toDate(data.QUIT_DATE);

    if (isBelowMarch2022(startDate)) {
        startDate = new Date(2022, 2, 1);
    }

    if (endDate >= new Date(2022, 11, 31)) {
        endDate = new Date(2022, 11, 31);
    }

    return getDiffMonthAndCompensation(startDate, endDate, data?.["UMP 2022"]!);

}

export function calculation2023(data: Data) {

    let startDate = toDate(data.JOIN_DATE);
    let endDate = toDate(data.QUIT_DATE);

    if (startDate <= new Date(2023, 0, 1)) {
        startDate = new Date(2023, 0, 1);
    }

    if (endDate >= new Date(2023, 11, 31)) {
        endDate = new Date(2023, 11, 31);
    }

    return getDiffMonthAndCompensation(startDate, endDate, data?.["UMP 2023"]!);

}

export function calculation2024(data: Data) {

    let startDate = toDate(data.JOIN_DATE);
    let endDate = toDate(data.QUIT_DATE);

    if (startDate <= new Date(2024, 0, 1)) {
        startDate = new Date(2024, 0, 1);
    }

    // Ini perhitungan sampai bulan Juli 2024
    if (endDate >= new Date(2024, 6, 31)) {
        endDate = new Date(2024, 6, 31);
    }

    const firstMonthDate = new Date(2024, 0, 1);
    const thirdMonthDate = new Date(2024, 2, 31);

    let totalFiftyPercentMonth = 0;
    let totalHundredPercentMonth = 0;

    if (startDate >= firstMonthDate && startDate <= thirdMonthDate) {
        // Total Month to pay 50% of UMP
        // from 1 Jan 2024 to 31 March 2024

        if (endDate <= thirdMonthDate) {
            totalFiftyPercentMonth = Math.max(0, formula.ROUND(dateDiffInDays(startDate, endDate) / 30, 0))
        } else {
            totalFiftyPercentMonth = Math.max(0, formula.ROUND(dateDiffInDays(startDate, thirdMonthDate) / 30, 0))
        }

    } else {
        // Total Month to pay 100% of UMP
        // from 1 April 2024 to 31 July 2024
        totalHundredPercentMonth = Math.max(0, formula.ROUND(dateDiffInDays(startDate, endDate) / 30, 0))
    }

    if (totalFiftyPercentMonth > 0) {
        totalHundredPercentMonth += Math.max(0, formula.ROUND(dateDiffInDays(new Date(2024, 3, 1), endDate) / 30, 0))
    }

    // console.log(
    //     {
    //         totalFiftyPercentMonth,
    //         totalHundredPercentMonth
    //     }
    // )

    if (!totalFiftyPercentMonth && !totalHundredPercentMonth) {

        if (startDate.getMonth() === 2) {
            if (endDate.getMonth() === 2 || (endDate.getMonth() === 3 && endDate.getDate() < 17)) {
                totalFiftyPercentMonth = Math.max(0, formula.ROUND(dateDiffInDays(startDate, endDate) / 30, 0));
                totalHundredPercentMonth = 0;
            } else {
                // console.log(startDate);
                totalFiftyPercentMonth = 0;
                totalHundredPercentMonth = Math.max(0, formula.ROUND(dateDiffInDays(new Date(2024, 3, 1), endDate) / 30, 0));
            }
        }

    }

    const ump = data["UMP 2024"]!;

    const fiftyPercentCompensation = Number((((totalFiftyPercentMonth / 12) * ump) / 2).toFixed(0));
    const hundredPercentCompensation = Number(((totalHundredPercentMonth / 12) * ump).toFixed(0));

    return {
        totalFiftyPercentMonth,
        totalHundredPercentMonth,
        fiftyPercentCompensation,
        hundredPercentCompensation
    }

}