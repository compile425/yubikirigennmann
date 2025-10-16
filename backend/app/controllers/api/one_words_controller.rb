class Api::OneWordsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_partnership, only: [ :index, :create ]

  def index
    one_words = @partnership.one_words
      .includes(:sender)
      .for_receiver(current_user)
      .by_year_month(params[:year], params[:month])
      .order(created_at: :desc)

    render json: one_words.map(&:to_response_hash)
  end

  def create
    partner = @partnership.partner_of(current_user)

    one_word = @partnership.one_words.build(
      content: one_word_params[:content],
      sender_id: current_user.id,
      receiver_id: partner.id
    )

    if one_word.save
      render json: { message: "メッセージを送信しました" }, status: :created
    else
      render json: { error: one_word.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def set_partnership
    @partnership = current_user.partnership
    return render json: [] unless @partnership
  end

  def one_word_params
    params.require(:one_word).permit(:content)
  end
end
