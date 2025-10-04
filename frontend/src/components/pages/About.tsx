import { useState } from 'react';
import Sidebar from '../ui/Sidebar';
import DissolvePartnershipModal from '../modals/DissolvePartnershipModal';

const About = () => {
  const [isDissolveModalOpen, setIsDissolveModalOpen] =
    useState<boolean>(false);

  return (
    <div className="yubi-app">
      <Sidebar onDissolvePartnership={() => setIsDissolveModalOpen(true)} />

      <main className="yubi-main">
        <div className="yubi-about-container">
          <div className="yubi-page-header">
            <h1 className="yubi-page-title">このアプリについて</h1>
          </div>

          <div className="yubi-feature-grid">
            <div className="yubi-feature-panel">
              <div className="yubi-feature-icon">💕</div>
              <div className="yubi-feature-text">
                <h3 className="yubi-feature-title">コンセプト</h3>
                <p className="yubi-feature-description">
                  ふたりの間の「言った言わない」をなくし、すれ違いを防ぐアプリです。
                </p>
              </div>
            </div>

            <div className="yubi-feature-panel">
              <div className="yubi-feature-icon">📝</div>
              <div className="yubi-feature-text">
                <h3 className="yubi-feature-title">STEP 1: 約束をする</h3>
                <p className="yubi-feature-description">
                  日常のささいな約束を、いつでも簡単に追加して、ふたりで共有できます。
                </p>
              </div>
            </div>

            <div className="yubi-feature-panel">
              <div className="yubi-feature-icon">🌟</div>
              <div className="yubi-feature-text">
                <h3 className="yubi-feature-title">STEP 2: 評価と感謝</h3>
                <p className="yubi-feature-description">
                  約束が守れたか、どう感じたかを星で評価し、感謝の言葉を伝えられます。
                </p>
              </div>
            </div>

            <div className="yubi-feature-panel">
              <div className="yubi-feature-icon">🌳</div>
              <div className="yubi-feature-text">
                <h3 className="yubi-feature-title">GOAL: 木を育てる</h3>
                <p className="yubi-feature-description">
                  約束を守り感謝を伝え合うことで、ふたりの「信頼の木」が成長していきます。
                </p>
              </div>
            </div>
          </div>

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
