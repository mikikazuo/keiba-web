export default function Page() {
  return (
    <>
      <p
        className="my-8 animate-fade-up text-center text-xl text-gray-300 md:text-2xl"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        特定商取引法に基づく表記
      </p>
      <table className="table-auto border-separate animate-fade-up text-left text-sm text-gray-300 md:text-lg">
        <tbody>
          <tr>
            <th className="border px-4 py-2">メールアドレス</th>
            <th className="border px-4 py-2">reversekeiba@gmail.com</th>
          </tr>
          <tr>
            <th className="border px-4 py-2">販売価格</th>
            <th className="border px-8 py-2">
              <ul className="list-disc">
                <li>「１ヶ月プラン」 980円（自動更新）</li>
                <li>「年間プラン」 9800円（自動更新）</li>
              </ul>
            </th>
          </tr>
          <tr>
            <th className="border px-4 py-2">
              販売価格以外で
              <br />
              お客様に発生する金銭
            </th>
            <th className="border px-4 py-2">
              コンテンツ閲覧時に必要となるインターネット接続料金、 <br />
              通信料金は、お客様のご負担となります。
              <br />
              それぞれの料金は、お客様がご利用の通信事業会社にお問い合わせください。
            </th>
          </tr>
          <tr>
            <th className="border px-4 py-2">
              有料コンテンツの
              <br />
              利用が可能となる時期
            </th>
            <th className="border px-4 py-2">
              会員登録＆有料プラン登録後、直ちにご利用いただけます。
            </th>
          </tr>
          <tr>
            <th className="border px-4 py-2">お支払方法</th>
            <th className="border px-4 py-2">
              クレジットカード（JCB / American Express / Diners Club）
            </th>
          </tr>
          <tr>
            <th className="border px-4 py-2">キャンセル・返金</th>
            <th className="border px-4 py-2">
              有料プランにお申込み後、
              お客様のご都合によるキャンセルはお受けできません。
              <br />
              また、途中解約による返金は承っておりません。
            </th>
          </tr>
        </tbody>
      </table>
      <div className="my-2 animate-fade-up text-center text-gray-300 md:text-lg">
        ※上記以外の事項に関しましては、お取引の際に請求があれば遅延なく提示いたします。
      </div>
    </>
  );
}
