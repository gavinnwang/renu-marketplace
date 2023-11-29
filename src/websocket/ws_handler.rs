use std::time::Instant;

use actix::Addr;
use actix_web::{get, HttpResponse, HttpRequest, web::{Payload, Data}, Error};
use actix_web_actors::ws;

use crate::{websocket::session, authentication::jwt::AuthenticationGuard};

use super::server;

#[get("/ws")]
async fn ws_route(
    req: HttpRequest,
    stream: Payload,
    auth_guard: AuthenticationGuard,
    srv: Data<Addr<server::ChatServer>>,
) -> Result<HttpResponse, Error> {
    let user_id = auth_guard.user_id as usize;
    ws::start(
        session::WsChatSession {
            user_id,
            hb: Instant::now(),
            chat_id_and_other_user_id: None,
            server_addr: srv.get_ref().clone(),
        },
        &req,
        stream,
    )
}

