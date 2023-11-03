import { IAnalysis } from "@/lib/getDb/analysis";
import { NextResponse } from "next/server";
const { BigQuery } = require("@google-cloud/bigquery");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("range");

  const bigqueryClient = new BigQuery().dataset("analysis");
  const sqlQuery = `SELECT * FROM \`${tableId}\``;
  const options = {
    query: sqlQuery,
    location: "us-west1",
  };

  const [rows]: IAnalysis[][] = await bigqueryClient.query(options);

  return NextResponse.json(rows);
}
