class Api::OneWordsController < ApplicationController
  before_action :authenticate_user!

  def index
    if current_user&.partnership
      one_words = current_user.partnership.one_words
        .includes(:sender)
        .where(receiver_id: current_user.id)
        .order(created_at: :desc)
      
      render json: one_words.map { |word|
        {
          id: word.id,
          content: word.content,
          created_at: word.created_at,
          sender_name: word.sender.name
        }
      }
    else
      render json: []
    end
  end

  def create
    unless current_user.partnership
      render json: { error: 'パートナーシップが存在しません' }, status: :unprocessable_entity
      return
    end

    partner = current_user.partnership.partner_of(current_user)

    one_word = current_user.partnership.one_words.build(
      content: one_word_params[:content],
      sender_id: current_user.id,
      receiver_id: partner.id
    )

    if one_word.save
      render json: { message: 'メッセージを送信しました' }, status: :created
    else
      render json: { error: one_word.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def one_word_params
    params.require(:one_word).permit(:content)
  end
end
