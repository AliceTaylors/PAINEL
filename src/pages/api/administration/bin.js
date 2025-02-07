import { promises as fsPromises } from "fs";

export async function searchBIN(binToSearch) {
  try {
    const binFile = await fsPromises.readFile(
      process.cwd() + "/binlist-data.csv",
      "utf8"
    );
    const rows = binFile.trim().split("\n");

    for (let row of rows) {
      const columns = row.split(",");
      const bin = columns[0];

      if (bin === binToSearch) {
        const brand = columns[1];
        const category = columns[3];
        const issuer = columns[4];
        const alpha_2 = columns[5];
        return `${brand} - ${category} - ${issuer} - ${alpha_2}`;
      }
    }

    return "";
  } catch (error) {
    return "";
  }
}
