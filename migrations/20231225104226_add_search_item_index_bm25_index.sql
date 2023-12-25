-- Add migration script here
CALL paradedb.create_bm25(
  index_name => 'search_item_idx',
  table_name => 'item',
  key_field => 'id',
  text_fields => '{
    description: {tokenizer: {type: "en_stem"}}, name: {tokenizer: {type: "en_stem"}}, 
  }'
);