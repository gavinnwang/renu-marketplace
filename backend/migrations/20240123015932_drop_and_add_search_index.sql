-- Add migration script here
CALL paradedb.drop_bm25('search_item_idx');
CALL paradedb.create_bm25(
  index_name => 'search_item_idx',
  table_name => 'item',
  key_field => 'id',
  text_fields => '{
    name: {tokenizer: {type: "en_stem"}}, 
  }'
);
