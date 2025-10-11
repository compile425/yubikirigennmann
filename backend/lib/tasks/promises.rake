namespace :promises do
  desc "Reset weekly evaluations for our_promises"
  task reset_weekly_evaluations: :environment do
    reset_count = 0

    Partnership.includes(:promises).find_each do |partnership|
      # 評価済みのふたりの約束を全てリセット
      partnership.promises.our_promises.each do |promise|
        if promise.reset_for_next_evaluation
          reset_count += 1
        end
      end
    end

    puts "Reset #{reset_count} our_promises for weekly evaluation"
  end
end
