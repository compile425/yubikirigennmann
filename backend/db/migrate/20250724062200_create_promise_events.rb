class CreatePromiseEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :promise_events do |t|
      t.string :event_type
      t.json :event_data
      t.bigint :promise_id

      t.timestamps
    end
  end
end
