const { BigQuery } = require("@google-cloud/bigquery");
import { cache } from "react";

export const getUpdateDate = cache(async (tableId: string) => {
  const bigqueryClient = new BigQuery().dataset("analysis");
  const sqlQuery = `SELECT
  FORMAT_TIMESTAMP('%m月%d日%H時', TIMESTAMP_MILLIS(last_modified_time), 'Asia/Tokyo')
  FROM \`keiba-web-forgcf.analysis.__TABLES__\`
  WHERE table_id='${tableId}'`;

  const options = {
    query: sqlQuery,
    location: "asia-east1",
  };

  const [[date]] = await bigqueryClient.query(options);
  return date["f0_"];
});

export interface IAnalysis {
  buy_type: string;
  popularity: string;
  payback: number;
  date: string;
  round: string;
  place: string;
  name: string;
  order1: string;
  order2: string;
  order3: string;
  payback_mvp: number;
  win_cnt: number;
  buyable_cnt: number;
  buy_type_cnt: number;
}

/** 馬券順序 */
export const cardOrder = [
  "単勝",
  "複勝",
  "枠連",
  "馬連",
  "ワイド",
  "馬単",
  "三連複",
  "三連単",
];

export const getAnalysis = cache(async (tableId: string) => {
  const bigqueryClient = new BigQuery().dataset("analysis");
  const sqlQuery = `SELECT * FROM \`${tableId}\``;
  const options = {
    query: sqlQuery,
    location: "asia-east1",
  };

  const [rows]: IAnalysis[][] = await bigqueryClient.query(options);
  rows.sort((a, b) =>
    cardOrder.indexOf(a["buy_type"]) < cardOrder.indexOf(b["buy_type"])
      ? -1
      : 1,
  );
  return rows;
});
