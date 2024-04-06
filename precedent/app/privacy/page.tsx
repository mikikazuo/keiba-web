import { Metadata } from "next";

export const metadata: Metadata = {
  title: "逆張り星人｜プライバシーポリシー",
};
export default function Page() {
  return (
    <>
      <div
        className="mx-6 w-auto max-w-7xl animate-fade-up text-gray-300"
        style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
      >
        <p className="my-8 text-center text-xl md:text-2xl">
          プライバシーポリシー
        </p>
        <p className="text-smmd:text-base my-3 text-left">
          運営者は、本ウェブサイト上で提供するサービス（以下、「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
        </p>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第1条（個人情報）
        </p>
        <div className="ml-6 text-sm md:text-base">
          ユーザーの個人情報とは、ユーザーに関する情報であって、特定のユーザーを識別出来る情報をいいます。
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第2条（個人情報の収集方法）
        </p>
        <div className="ml-6 text-sm md:text-base">
          本サービスにおけるユーザー情報の取得方法は、以下のとおりとします。
          <ol className="ml-4 list-decimal">
            <li>端末操作を通じてお客様にご入力いただく場合</li>
            <li>
              ユーザーから直接または書面等の媒体を通じてご提供いただく場合
            </li>
            <li>
              ユーザーによるサービス、商品、広告、コンテンツの利用・閲覧によって自動的に送信される場合
            </li>
            <li>
              上記の他、ユーザーの同意を得た第三者から提供を受ける場合など、適法に取得する場合
            </li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第3条（個人情報を収集・利用する目的）
        </p>
        <div className="ml-6 text-sm md:text-base">
          運営者が個人情報を収集・利用する目的は、以下のとおりです。
          <ol className="ml-4 list-decimal">
            <li>本サービスの提供・運営のため</li>
            <li>
              ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）
            </li>
            <li>
              ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び運営者が提供する他のサービスの案内のメールを送付するため
            </li>
            <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
            <li>
              利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため
            </li>
            <li>
              ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため
            </li>
            <li>有料サービスにおいて、ユーザーに利用料金を請求するため</li>
            <li>上記の利用目的に付随する目的</li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第4条（利用目的の変更）
        </p>
        <div className="ml-6 text-sm md:text-base">
          <ol className="ml-4 list-decimal">
            <li>
              運営者は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。
            </li>
            <li>
              利用目的の変更を行った場合には、変更後の目的について、運営者所定の方法により、ユーザーに通知し、または本ウェブサイト上に公表するものとします。
            </li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第5条（個人情報の第三者提供）
        </p>
        <div className="ml-6 text-sm md:text-base">
          運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
          <br />
          ただし、個人情報保護法その他の法令で認められる場合を除きます。
        </div>
        <div className="ml-6 text-sm md:text-base">
          <ol className="ml-4 list-decimal">
            <li>
              人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
            </li>
            <li>
              公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
            </li>
            <li>
              国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
            </li>
            <li>
              予め次の事項を告知あるいは公表し、かつ運営者が個人情報保護委員会に届出をしたとき
              <ol className="ml-4 list-disc">
                <li>利用目的に第三者への提供を含むこと</li>
                <li>第三者に提供されるデータの項目</li>
                <li>第三者への提供の手段または方法</li>
                <li>
                  本人の求めに応じて個人情報の第三者への提供を停止すること
                </li>
                <li>本人の求めを受け付ける方法</li>
              </ol>
            </li>
            <li>
              前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
              <ol className="ml-4 list-disc">
                <li>
                  運営者が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合
                </li>
                <li>
                  合併その他の事由による事業の承継に伴って個人情報が提供される場合
                </li>
                <li>
                  個人情報を特定の者との間で共同して利用する場合であって、その旨並びに共同して利用される個人情報の項目、共同して利用する者の範囲、利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について、あらかじめ本人に通知し、または本人が容易に知り得る状態に置いた場合
                </li>
              </ol>
            </li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第6条（個人情報の開示）
        </p>
        <div className="ml-6 text-sm md:text-base">
          <ol className="ml-4 list-decimal">
            <li>
              運営者は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。なお、個人情報の開示に際しては、1件あたり1、000円の手数料を申し受けます。
            </li>
            <ol className="ml-4 list-disc">
              <li>
                本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合
              </li>
              <li>
                運営者の業務の適正な実施に著しい支障を及ぼすおそれがある場合
              </li>
              <li>その他法令に違反することとなる場合</li>
            </ol>
            <li>
              前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。
            </li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第7条（個人情報の訂正および削除）
        </p>
        <div className="ml-6 text-sm md:text-base">
          <ol className="ml-4 list-decimal">
            <li>
              ユーザーは、運営者の保有する自己の個人情報が誤った情報である場合には、運営者が定める手続きにより、運営者に対して個人情報の訂正、追加または削除（以下、「訂正等」といいます。）を請求することができます。
            </li>
            <li>
              運営者は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。
            </li>
            <li>
              運営者は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これをユーザーに通知します。
            </li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第8条（個人情報の利用停止等）
        </p>
        <div className="ml-6 text-sm md:text-base">
          <ol className="ml-4 list-decimal">
            <li>
              運営者は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下、「利用停止等」といいます。）を求められた場合には、遅滞なく必要な調査を行います。
            </li>
            <li>
              前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。
            </li>
            <li>
              運営者は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知します。
            </li>
            <li>
              前2項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、ユーザーの権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。
            </li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第9条（プライバシーポリシーの変更）
        </p>
        <div className="ml-6 text-sm md:text-base">
          <ol className="ml-4 list-decimal">
            <li>
              本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。
            </li>
            <li>
              運営者が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
            </li>
          </ol>
        </div>
        <p className="mb-3 mt-5 text-left text-lg md:text-xl">
          第10条（お問い合わせ窓口）
        </p>
        <div className="ml-6 text-sm md:text-base">
          本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
          <br />
          Eメールアドレス：info@reversekeiba.com
        </div>
        <p className="mb-3 mt-5 text-right">2023年9月28日更新</p>
      </div>
    </>
  );
}
