require 'rails_helper'

RSpec.describe OneWord, type: :model do
  describe 'scopes' do
    let(:partnership) { create(:partnership) }
    let(:user) { partnership.user }
    let(:partner) { partnership.partner }

    describe '.by_year_month' do
      let!(:jan_word) do
        word = create(:one_word, partnership: partnership, sender: partner, receiver: user)
        word.update(created_at: Date.new(2025, 1, 15))
        word
      end

      let!(:feb_word) do
        word = create(:one_word, partnership: partnership, sender: partner, receiver: user)
        word.update(created_at: Date.new(2025, 2, 10))
        word
      end

      it '指定された年月の一言を返す' do
        result = OneWord.by_year_month(2025, 1)
        expect(result).to include(jan_word)
        expect(result).not_to include(feb_word)
      end

      it '年月が指定されていない場合は全て返す' do
        result = OneWord.by_year_month(nil, nil)
        expect(result).to include(jan_word, feb_word)
      end
    end

    describe '.for_receiver' do
      let!(:word_for_user) { create(:one_word, partnership: partnership, sender: partner, receiver: user) }
      let!(:word_for_partner) { create(:one_word, partnership: partnership, sender: user, receiver: partner) }

      it '指定された受信者の一言のみを返す' do
        result = OneWord.for_receiver(user)
        expect(result).to include(word_for_user)
        expect(result).not_to include(word_for_partner)
      end
    end
  end

  describe '#to_response_hash' do
    let(:partnership) { create(:partnership) }
    let(:one_word) { create(:one_word, partnership: partnership, sender: partnership.partner, receiver: partnership.user) }

    it '正しいハッシュ形式を返す' do
      hash = one_word.to_response_hash
      expect(hash).to include(
        id: one_word.id,
        content: one_word.content,
        created_at: one_word.created_at,
        sender_name: one_word.sender.name
      )
    end
  end
end

