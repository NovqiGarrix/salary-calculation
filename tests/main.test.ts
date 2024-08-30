import { calculation2022, calculation2023, calculation2024, dateDiffInDays, isBelowMarch2022, readCSVFile, toDate } from "../utils.ts";
import * as formula from 'npm:@formulajs/formulajs@4.4.5';
import { assertEquals, assertFalse, assert, assertObjectMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { Data } from "../types.ts";
import * as csv from 'npm:json-2-csv@5.5.5';

const textDecoder = new TextDecoder();


// const rawData = readCSVFile<Data>(await Deno.readTextFile("data.csv"));
const activeData = readCSVFile<Data>(await Deno.readTextFile("aktif.csv"));
const resignData = readCSVFile<Data>(await Deno.readTextFile("resign.csv"));

Deno.test("Read CSV File", async () => {

    console.log(readCSVFile<Data>(await Deno.readTextFile("aktif.csv")));

});

Deno.test("toDate", () => {
    console.log(toDate("2011/9/10").toDateString())
});

Deno.test("Round function", () => {

    assertEquals(formula.ROUND(dateDiffInDays(toDate("2022/08/22"), toDate("2022/12/31")) / 30, 0), 4)

});

Deno.test("Is below feb 2022 func", () => {

    assertFalse(isBelowMarch2022(toDate("2022/03/01")));
    assert(isBelowMarch2022(toDate("2021/03/01")));

});

const TEST_SALARY = 5000000;

Deno.test("2022 Calculation", () => {

    const data: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2005/05/30",
        QUIT_DATE: "2022/05/30",
        "UMP 2022": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2022(data), {
        diffMonth: 3,
        compensation: 625000
    });

    const data2: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2022/01/05",
        QUIT_DATE: "2024/12/24",
        "UMP 2022": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2022(data2), {
        diffMonth: 10,
        compensation: 2083333
    });

    const data3: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2022/01/17",
        QUIT_DATE: "2025/01/21",
        "UMP 2022": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2022(data3), {
        diffMonth: 10,
        compensation: 2083333
    });

    const data4: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2022/03/23",
        QUIT_DATE: "2024/09/26",
        "UMP 2022": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2022(data4), {
        diffMonth: 9,
        compensation: 1875000
    });

});

Deno.test("2022", async () => {

    const activeMapped = activeData.map((data) => {
        const result = calculation2022(data);

        return {
            ...data,
            MASA_KERJA_2022: result.diffMonth,
            KOMPENSASI_2022: result.compensation
        }
    }).filter(Boolean);

    const resignMapped = resignData.map((data) => {
        const result = calculation2022(data);

        return {
            ...data,
            MASA_KERJA_2022: result.diffMonth,
            KOMPENSASI_2022: result.compensation
        }
    }).filter(Boolean);

    await Deno.writeTextFile("2022_active.csv", csv.json2csv(activeMapped));
    await Deno.writeTextFile("2022_resign.csv", csv.json2csv(resignMapped));

    const activeOutput = await new Deno.Command("npx", {
        args: ["@aternus/csv-to-xlsx", "-f", "-i", "2022_active.csv"]
    }).output();

    console.log(textDecoder.decode(activeOutput.stdout))

    const resignOutput = await new Deno.Command("npx", {
        args: ["@aternus/csv-to-xlsx", "-f", "-i", "2022_resign.csv"]
    }).output();

    console.log(textDecoder.decode(resignOutput.stdout))

});

Deno.test("dateDiffInDays", () => {
    // 2024/02/17
    // console.log(
    //     formula.ROUND(
    //         dateDiffInDays(new Date(2024, 1, 17), new Date(2024, 1, 18)) / 30, 0
    //     )
    // );

    // Math.max(0, formula.ROUND(
    //     dateDiffInDays(new Date(2024, 1, 17), new Date(2024, 1, 18)) / 30, 0
    // ));

    // console.log(getDiffMonthAndCompensation(new Date(2024, 1, 17), new Date(2024, 1, 18), TEST_SALARY));

    // console.log(
    //     formula.ROUND(
    //         dateDiffInDays(new Date(2024, 2, 31), new Date(2024, 3, 17)) / 30, 0
    //     )
    // )

    // console.log(
    //     formula.ROUND(
    //         dateDiffInDays(new Date(2024, 2, 19), new Date(2024, 4, 10)) / 30, 0
    //     )
    // )

    console.log(dateDiffInDays(new Date(2024, 2, 19), new Date(2024, 4, 10)));
});

Deno.test("2023 Calculation", () => {

    const data: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2005/05/30",
        QUIT_DATE: "2023/05/30",
        "UMP 2023": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2023(data), {
        diffMonth: 5,
        compensation: 1041667
    });

    const data2: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2005/05/30",
        QUIT_DATE: "2024/05/30",
        "UMP 2023": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2023(data2), {
        diffMonth: 12,
        compensation: 2500000
    });

    const data3: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2023/02/02",
        QUIT_DATE: "2023/05/30",
        "UMP 2023": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2023(data3), {
        diffMonth: 4,
        compensation: 833333
    });

});

function filterFor2023(data: Data) {
    return toDate(data.JOIN_DATE) < new Date(2024, 0, 1);
}

Deno.test("2023", async () => {

    const activeMapped = activeData.filter(filterFor2023).map((data) => {
        const result = calculation2023(data);

        return {
            ...data,
            MASA_KERJA_2023: result.diffMonth,
            KOMPENSASI_2023: result.compensation
        }
    }).filter(Boolean);

    const resignMapped = resignData.filter(filterFor2023).map((data) => {
        const result = calculation2023(data);

        return {
            ...data,
            MASA_KERJA_2023: result.diffMonth,
            KOMPENSASI_2023: result.compensation
        }
    }).filter(Boolean);

    const CSV_ACTIVE_FILENAME = "2023_active.csv";
    const CSV_RESIGN_FILENAME = "2023_resign.csv";

    await Deno.writeTextFile(CSV_ACTIVE_FILENAME, csv.json2csv(activeMapped));
    await Deno.writeTextFile(CSV_RESIGN_FILENAME, csv.json2csv(resignMapped));

    // Check if file exists
    // delete file if exists
    if (await exists(`xlsx/${CSV_ACTIVE_FILENAME.split(".")[0]}`)) {
        await Deno.remove(CSV_ACTIVE_FILENAME);
    }

    if (await exists(`xlsx/${CSV_RESIGN_FILENAME.split(".")[0]}`)) {
        await Deno.remove(CSV_RESIGN_FILENAME);
    }

    const activeOutput = await new Deno.Command("npx", {
        args: ["@aternus/csv-to-xlsx", "-f", "-i", CSV_ACTIVE_FILENAME]
    }).output();

    console.log(textDecoder.decode(activeOutput.stdout))

    const resignOutput = await new Deno.Command("npx", {
        args: ["@aternus/csv-to-xlsx", "-f", "-i", CSV_RESIGN_FILENAME]
    }).output();

    console.log(textDecoder.decode(resignOutput.stdout))

});

Deno.test("2024 Calculation", () => {

    const data: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2005/05/30",
        QUIT_DATE: "2024/08/30",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data), {
        totalFiftyPercentMonth: 3,
        totalHundredPercentMonth: 4,
        fiftyPercentCompensation: 625000,
        hundredPercentCompensation: 1666667
    });

    const data2: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2023/05/30",
        QUIT_DATE: "2024/06/30",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data2), {
        totalFiftyPercentMonth: 3,
        totalHundredPercentMonth: 3,
        fiftyPercentCompensation: 625000,
        hundredPercentCompensation: 1250000
    });

    const data3: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2024/02/02",
        QUIT_DATE: "2024/06/30",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data3), {
        totalFiftyPercentMonth: 2,
        totalHundredPercentMonth: 3,
        fiftyPercentCompensation: 416667,
        hundredPercentCompensation: 1250000
    });

    const data4: Data = {
        EMPLOYEE_STATUS: "Active",
        JOIN_DATE: "2024/04/02",
        QUIT_DATE: "2024/09/30",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data4), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 4,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 1666667
    });

    const data5: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/02/17",
        QUIT_DATE: "2024/02/18",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data5), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 0,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 0
    });

    const data6: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/01/17",
        QUIT_DATE: "2024/01/17",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data6), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 0,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 0
    });

    const data7: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/31",
        QUIT_DATE: "2024/04/17",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data7), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 1,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 416667
    });

    const data8: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/28",
        QUIT_DATE: "2024/05/24",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data8), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 2,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 833333
    });

    const data9: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/25",
        QUIT_DATE: "2024/06/26",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data9), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 3,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 1250000
    });

    const data10: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/08",
        QUIT_DATE: "2024/03/30",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data10), {
        totalFiftyPercentMonth: 1,
        totalHundredPercentMonth: 0,
        fiftyPercentCompensation: 208333,
        hundredPercentCompensation: 0
    });

    const data11: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/08",
        QUIT_DATE: "2024/04/01",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data11), {
        totalFiftyPercentMonth: 1,
        totalHundredPercentMonth: 0,
        fiftyPercentCompensation: 208333,
        hundredPercentCompensation: 0
    });

    const data12: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/06",
        QUIT_DATE: "2024/04/24",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data12), {
        totalFiftyPercentMonth: 1,
        totalHundredPercentMonth: 1,
        fiftyPercentCompensation: 208333,
        hundredPercentCompensation: 416667
    });

    const data13: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/08",
        QUIT_DATE: "2024/05/22",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data13), {
        totalFiftyPercentMonth: 1,
        totalHundredPercentMonth: 2,
        fiftyPercentCompensation: 208333,
        hundredPercentCompensation: 833333
    });

    const data14: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/05",
        QUIT_DATE: "2024/06/01",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data14), {
        totalFiftyPercentMonth: 1,
        totalHundredPercentMonth: 2,
        fiftyPercentCompensation: 208333,
        hundredPercentCompensation: 833333
    });

    const data15: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/19",
        QUIT_DATE: "2024/05/10",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data15), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 1,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 416667
    });

    const data16: Data = {
        EMPLOYEE_STATUS: "Non-Active",
        JOIN_DATE: "2024/03/18",
        QUIT_DATE: "2024/07/1",
        "UMP 2024": TEST_SALARY,
        EMPLOYEE_ID: "HELLO"
    }

    assertObjectMatch(calculation2024(data16), {
        totalFiftyPercentMonth: 0,
        totalHundredPercentMonth: 3,
        fiftyPercentCompensation: 0,
        hundredPercentCompensation: 1250000
    });

});

function filterFor2024(data: Data) {
    return toDate(data.QUIT_DATE) >= new Date(2024, 0, 1);
}

Deno.test("2024", async () => {

    const activeMapped = activeData.filter(filterFor2024).map((data) => {
        const result = calculation2024(data);

        return {
            ...data,
            "MASA_KERJA_50%_2024": result.totalFiftyPercentMonth,
            "KOMPENSASI_50%_2024": result.fiftyPercentCompensation,
            "MASA_KERJA_100%_2024": result.totalHundredPercentMonth,
            "KOMPENSASI_100%_2024": result.hundredPercentCompensation
        }
    }).filter(Boolean);

    const resignMapped = resignData.filter(filterFor2024).map((data) => {
        const result = calculation2024(data);

        return {
            ...data,
            "MASA_KERJA_50%_2024": result.totalFiftyPercentMonth,
            "KOMPENSASI_50%_2024": result.fiftyPercentCompensation,
            "MASA_KERJA_100%_2024": result.totalHundredPercentMonth,
            "KOMPENSASI_100%_2024": result.hundredPercentCompensation
        }
    }).filter(Boolean);

    const CSV_ACTIVE_FILENAME = "2024_active.csv";
    const CSV_RESIGN_FILENAME = "2024_resign.csv";

    await Deno.writeTextFile(CSV_ACTIVE_FILENAME, csv.json2csv(activeMapped));
    await Deno.writeTextFile(CSV_RESIGN_FILENAME, csv.json2csv(resignMapped));

    // Check if file exists
    // delete file if exists
    if (await exists(`xlsx/${CSV_ACTIVE_FILENAME.split(".")[0]}`)) {
        await Deno.remove(CSV_ACTIVE_FILENAME);
    }

    if (await exists(`xlsx/${CSV_RESIGN_FILENAME.split(".")[0]}`)) {
        await Deno.remove(CSV_RESIGN_FILENAME);
    }

    const activeOutput = await new Deno.Command("npx", {
        args: ["@aternus/csv-to-xlsx", "-f", "-i", CSV_ACTIVE_FILENAME]
    }).output();

    console.log(textDecoder.decode(activeOutput.stdout))

    const resignOutput = await new Deno.Command("npx", {
        args: ["@aternus/csv-to-xlsx", "-f", "-i", CSV_RESIGN_FILENAME]
    }).output();

    console.log(textDecoder.decode(resignOutput.stdout))

});