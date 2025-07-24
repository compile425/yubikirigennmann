class CreateNoteReadEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :note_read_events do |t|
      t.datetime :read_at
      t.bigint :note_id
      t.bigint :reader_id

      t.timestamps
    end
  end
end
