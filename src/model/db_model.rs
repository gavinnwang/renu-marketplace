use sqlx::{MySqlPool, MySql, Transaction};

/// The database pool type.
pub type DbPool = MySqlPool;

/// The database transaction type.
pub type Tx = Transaction<'static, MySql>;

