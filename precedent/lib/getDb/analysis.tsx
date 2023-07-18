const { BigQuery } = require("@google-cloud/bigquery");

export async function getUpdateDate(tableId: string) {
  const bigqueryClient = new BigQuery().dataset("analysis");
  const sqlQuery = `SELECT
  FORMAT_TIMESTAMP('%m月%d日%H時', TIMESTAMP_MILLIS(last_modified_time), 'Asia/Tokyo')
  FROM \`keiba-web-forgcf.analysis.__TABLES__\`
  WHERE table_id='${tableId}'`

  const options = {
    query: sqlQuery,
    location: "us-west1",
  };

  const [[date]] = await bigqueryClient.query(options);
  return date['f0_'];
}

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
  cnt: number;
  whole_cnt: number;
}

/** 馬券順序 */
const cardOrder = [
  "単勝",
  "複勝",
  "枠連",
  "馬連",
  "ワイド",
  "馬単",
  "三連複",
  "三連単",
];

export async function getAnalysis(tableId: string) {
  // const [rows]: IAnalysis[][] = [[
  //   {
  //     buy_type: '馬連',
  //     popularity: '11 - 8',
  //     payback: 34250,
  //     date: '2023年6月25日',
  //     round: '5',
  //     place: '3回東京8日目',
  //     name: '2歳新馬',
  //     order1: 'トーセンクライネ',
  //     order2: 'タガノエクレール',
  //     order3: 'キャネル',
  //     payback_mvp: 34250,
  //     cnt: 1,
  //     whole_cnt: 36
  //   },
  //   {
  //     buy_type: '三連複',
  //     popularity: '11 - 3 - 8',
  //     payback: 80570,
  //     date: '2023年6月25日',
  //     round: '5',
  //     place: '3回東京8日目',
  //     name: '2歳新馬',
  //     order1: 'トーセンクライネ',
  //     order2: 'タガノエクレール',
  //     order3: 'キャネル',
  //     payback_mvp: 80570,
  //     cnt: 1,
  //     whole_cnt: 36
  //   },
  //   {
  //     buy_type: '三連単',
  //     popularity: '11 → 8 → 3',
  //     payback: 674520,
  //     date: '2023年6月25日',
  //     round: '5',
  //     place: '3回東京8日目',
  //     name: '2歳新馬',
  //     order1: 'トーセンクライネ',
  //     order2: 'タガノエクレール',
  //     order3: 'キャネル',
  //     payback_mvp: 674520,
  //     cnt: 1,
  //     whole_cnt: 36
  //   },
  //   {
  //     buy_type: '馬単',
  //     popularity: '11 → 8',
  //     payback: 77430,
  //     date: '2023年6月25日',
  //     round: '5',
  //     place: '3回東京8日目',
  //     name: '2歳新馬',
  //     order1: 'トーセンクライネ',
  //     order2: 'タガノエクレール',
  //     order3: 'キャネル',
  //     payback_mvp: 77430,
  //     cnt: 1,
  //     whole_cnt: 36
  //   },
  //   {
  //     buy_type: '複勝',
  //     popularity: '5',
  //     payback: 4180,
  //     date: '2023年6月25日',
  //     round: '1',
  //     place: '3回東京8日目',
  //     name: '2歳未勝利',
  //     order1: 'コラソンビート',
  //     order2: 'グラビティブラスト',
  //     order3: 'ブライトアゲイン',
  //     payback_mvp: 720,
  //     cnt: 14,
  //     whole_cnt: 36
  //   },
  //   {
  //     buy_type: 'ワイド',
  //     popularity: '10 - 11',
  //     payback: 12080,
  //     date: '2023年6月25日',
  //     round: '1',
  //     place: '1回函館6日目',
  //     name: '3歳未勝利',
  //     order1: 'スピニングマーリン',
  //     order2: 'アイアンムーン',
  //     order3: 'ヨドノルーキー',
  //     payback_mvp: 12080,
  //     cnt: 1,
  //     whole_cnt: 36
  //   },
  //   {
  //     buy_type: '枠連',
  //     popularity: '12 - 16',
  //     payback: 7490,
  //     date: '2023年6月25日',
  //     round: '2',
  //     place: '3回阪神8日目',
  //     name: '3歳未勝利',
  //     order1: 'アルタビスタ',
  //     order2: 'ハクサンバード',
  //     order3: 'デュメイカズマ',
  //     payback_mvp: 7490,
  //     cnt: 1,
  //     whole_cnt: 33
  //   },
  //   {
  //     buy_type: '単勝',
  //     popularity: '10',
  //     payback: 8000,
  //     date: '2023年6月25日',
  //     round: '7',
  //     place: '3回阪神8日目',
  //     name: '3歳以上1勝クラス',
  //     order1: 'プリマヴィータ',
  //     order2: 'ジューンアヲニヨシ',
  //     order3: 'サトノクローク',
  //     payback_mvp: 4710,
  //     cnt: 2,
  //     whole_cnt: 36
  //   }
  // ]]

  const bigqueryClient = new BigQuery().dataset("analysis");
  const sqlQuery = `SELECT * FROM \`${tableId}\``;
  const options = {
    query: sqlQuery,
    location: "us-west1",
  };

  const [rows]: IAnalysis[][] = await bigqueryClient.query(options);

  rows.sort((a, b) => cardOrder.indexOf(a["buy_type"]) < cardOrder.indexOf(b["buy_type"]) ? -1 : 1);
  return rows;
}
