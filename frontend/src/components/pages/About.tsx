import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';
import { useAuth } from '../../contexts/useAuth';

const About = () => {
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);
  const { token, partner } = useAuth();
  const navigate = useNavigate();

  const getButtonConfig = () => {
    if (!token) {
      return { text: 'アプリを始める', path: '/' };
    } else if (!partner) {
      return { text: 'パートナーと始める', path: '/invite-partner' };
    } else {
      return { text: 'アプリに戻る', path: '/' };
    }
  };

  const buttonConfig = getButtonConfig();

  const handleCTAClick = () => {
    navigate(buttonConfig.path);
  };

  return (
    <div className="app-wrapper">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />

      <main className="board-container">
        <div className="yubi-about-page">
          {/* ヒーローセクション */}
          <section className="yubi-about-hero">
            <h1 className="yubi-about-hero__title">
              ふたりの約束を、
              <br />
              もっと大切に。
            </h1>
            <p className="yubi-about-hero__subtitle">
              「ゆびきりげんまん」は、カップルやパートナー同士の約束を可視化し、
              <br />
              お互いの信頼関係を育てるためのアプリです。
            </p>
          </section>

          {/* 機能紹介セクション */}
          <section className="yubi-about-features">
            <h2 className="yubi-about-section-title">主な機能</h2>

            {/* 約束一覧 */}
            <div className="yubi-about-feature">
              <div className="yubi-about-feature__content">
                <div className="yubi-about-feature__badge">01</div>
                <h3 className="yubi-about-feature__title">約束一覧</h3>
                <p className="yubi-about-feature__description">
                  「あなたの約束」「パートナーの約束」「ふたりの約束」の3種類の約束を管理できます。
                  <br />
                  <br />
                  <strong>あなたの約束：</strong>
                  自分がパートナーにする約束。期日を設定して、守れたかパートナーが評価します。
                  <br />
                  <br />
                  <strong>パートナーの約束：</strong>
                  パートナーがあなたにする約束。期日が来たら、あなたが評価します。
                  <br />
                  <br />
                  <strong>ふたりの約束：</strong>
                  ふたりで守る大切な約束。毎週交互に評価し合い、繰り返し確認することで関係性を深めます。
                </p>
                <ul className="yubi-about-feature__list">
                  <li>約束を簡単に追加・編集・削除</li>
                  <li>期日を設定して管理</li>
                  <li>3種類の約束で目的に応じて使い分け</li>
                </ul>
              </div>
              <div className="yubi-about-feature__image">
                <div className="yubi-about-feature__placeholder">
                  動画キャプチャ
                  <br />
                  （約束一覧画面）
                </div>
              </div>
            </div>

            {/* 評価待ちの約束 */}
            <div className="yubi-about-feature yubi-about-feature--reverse">
              <div className="yubi-about-feature__image">
                <div className="yubi-about-feature__placeholder">
                  動画キャプチャ
                  <br />
                  （評価待ち画面）
                </div>
              </div>
              <div className="yubi-about-feature__content">
                <div className="yubi-about-feature__badge">02</div>
                <h3 className="yubi-about-feature__title">評価待ちの約束</h3>
                <p className="yubi-about-feature__description">
                  パートナーが作成した約束の期日が来ると、あなたの「評価待ちの約束」に表示されます。
                  <br />
                  <br />
                  約束が守られたかを⭐️1〜5で評価し、感謝や気持ちをコメントで伝えられます。
                  毎週日曜日には、ふたりの約束の評価ターンが交互に回ってきます。
                </p>
                <ul className="yubi-about-feature__list">
                  <li>期日が来た約束を一覧で確認</li>
                  <li>⭐️5段階評価 + コメント機能</li>
                  <li>評価が必要な件数をサイドバーに表示</li>
                </ul>
              </div>
            </div>

            {/* 過去の評価 */}
            <div className="yubi-about-feature">
              <div className="yubi-about-feature__content">
                <div className="yubi-about-feature__badge">03</div>
                <h3 className="yubi-about-feature__title">過去の評価</h3>
                <p className="yubi-about-feature__description">
                  パートナーから評価された約束を振り返ることができます。
                  <br />
                  <br />
                  年月で検索して、過去のどの時期にどんな約束をしたか、どんな評価をもらったかを確認できます。
                  ふたりの成長の記録として、大切な思い出になります。
                </p>
                <ul className="yubi-about-feature__list">
                  <li>年月で検索して過去の約束を振り返り</li>
                  <li>評価コメントと⭐️評価を確認</li>
                  <li>約束の種類別に分類して表示</li>
                </ul>
              </div>
              <div className="yubi-about-feature__image">
                <div className="yubi-about-feature__placeholder">
                  動画キャプチャ
                  <br />
                  （過去の評価画面）
                </div>
              </div>
            </div>

            {/* ふたりの記録 */}
            <div className="yubi-about-feature yubi-about-feature--reverse">
              <div className="yubi-about-feature__image">
                <div className="yubi-about-feature__placeholder">
                  動画キャプチャ
                  <br />
                  （ふたりの記録画面）
                </div>
              </div>
              <div className="yubi-about-feature__content">
                <div className="yubi-about-feature__badge">04</div>
                <h3 className="yubi-about-feature__title">ふたりの記録</h3>
                <p className="yubi-about-feature__description">
                  約束の評価が⭐️4以上だと、今月のりんごが1つ増えます。
                  <br />
                  <br />
                  りんごが増えるほど、真ん中のりんごの木が成長していきます。
                  ふたりの信頼関係が可視化され、お互いの頑張りを実感できます。
                  毎月リセットされるので、新しい気持ちで頑張れます。
                </p>
                <ul className="yubi-about-feature__list">
                  <li>⭐️4以上の評価で今月のりんごが増加</li>
                  <li>りんごの数に応じて木が成長（3段階）</li>
                  <li>ふたりの平均スコアとトレンドを表示</li>
                </ul>
              </div>
            </div>

            {/* ちょっと一言 */}
            <div className="yubi-about-feature">
              <div className="yubi-about-feature__content">
                <div className="yubi-about-feature__badge">05</div>
                <h3 className="yubi-about-feature__title">ちょっと一言</h3>
                <p className="yubi-about-feature__description">
                  日頃の感謝や、ふと思ったことを手紙のように送れる機能です。
                  <br />
                  <br />
                  約束とは別に、気軽にメッセージを交換できます。
                  新しいメッセージが届くと、サイドバーに通知が表示されます。
                  年月で検索して、過去のメッセージを振り返ることもできます。
                </p>
                <ul className="yubi-about-feature__list">
                  <li>いつでも気軽にメッセージを送信</li>
                  <li>新着通知機能</li>
                  <li>年月で過去のメッセージを検索</li>
                </ul>
              </div>
              <div className="yubi-about-feature__image">
                <div className="yubi-about-feature__placeholder">
                  動画キャプチャ
                  <br />
                  （ちょっと一言画面）
                </div>
              </div>
            </div>

            {/* パートナー管理 */}
            <div className="yubi-about-feature yubi-about-feature--reverse">
              <div className="yubi-about-feature__image">
                <div className="yubi-about-feature__placeholder">
                  動画キャプチャ
                  <br />
                  （パートナー招待画面）
                </div>
              </div>
              <div className="yubi-about-feature__content">
                <div className="yubi-about-feature__badge">06</div>
                <h3 className="yubi-about-feature__title">
                  パートナーと始める・解消
                </h3>
                <p className="yubi-about-feature__description">
                  招待コードを発行して、パートナーを招待できます。
                  <br />
                  <br />
                  パートナーが招待コードを入力すると、ふたりのパートナーシップが成立。
                  すぐに約束の共有が始まります。
                  また、パートナーシップはいつでも解消できます（すべてのデータが削除されます）。
                </p>
                <ul className="yubi-about-feature__list">
                  <li>招待コードで簡単にパートナーシップを開始</li>
                  <li>デフォルトの「ふたりの約束」が自動作成</li>
                  <li>いつでもパートナーシップを解消可能</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTAセクション */}
          <section className="yubi-about-cta">
            <h2 className="yubi-about-cta__title">
              さあ、ふたりの約束を始めよう
            </h2>
            <p className="yubi-about-cta__description">
              小さな約束を積み重ねて、大きな信頼を育てましょう。
            </p>
            <button onClick={handleCTAClick} className="yubi-about-cta__button">
              {buttonConfig.text}
            </button>
          </section>
        </div>
      </main>

      <DissolvePartnershipModal
        isOpen={isDissolveModalOpen}
        onClose={() => setIsDissolveModalOpen(false)}
      />
    </div>
  );
};

export default About;
