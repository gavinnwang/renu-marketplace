use std::time::{Duration, Instant};

use actix::{
    fut, prelude::ContextFutureSpawner, Actor, ActorContext, ActorFutureExt, Addr, AsyncContext,
    Handler, StreamHandler, WrapFuture,
};
use actix_web::web::Data;
use actix_web_actors::ws;

use crate::{
    model::db_model::DbPool, repository::chat_repository::check_if_user_id_is_part_of_chat_group,
};

use super::server;

/// How often heartbeat pings are sent
const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

/// How long before lack of client response causes a timeout
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Debug)]
pub struct WsChatSession {
    // unique session id
    // pub id: usize,
    pub user_id: usize,

    // Client must send ping at least once per 10 seconds (CLIENT_TIMEOUT),
    // otherwise we drop connection.
    pub hb: Instant,

    // joined room id
    pub room_id: Option<usize>,

    // chat server address to send message
    pub server_addr: Addr<server::ChatServer>,
    // pool: Data<DbPool>,
}

impl WsChatSession {
    /// helper method that sends ping to client every 5 seconds (HEARTBEAT_INTERVAL).
    ///
    /// also this method checks heartbeats from client
    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                // heartbeat timed out
                tracing::info!("Websocket Client heartbeat failed, disconnecting!");

                // notify chat server
                // act.addr.do_send(server::Disconnect { id: act.id });

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }

            ctx.ping(b"hi");
        });
    }
}

impl Actor for WsChatSession {
    type Context = ws::WebsocketContext<Self>;

    // called on actor start
    // register a ws sessionw ith ChatServer
    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);

        let addr = ctx.address(); // get address of this actor

        self.server_addr
            .send(server::Connect {
                user_id: self.user_id,
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(_) => {
                        tracing::info!(
                            "Session with user id {} connected to chat server",
                            act.user_id
                        );
                        ctx.text("hello");
                    }
                    // something is wrong with chat server
                    _ => {
                        tracing::error!("Session actor failed to start: Can not connect to server");
                        ctx.stop();
                    }
                }
                fut::ready(())
            })
            .spawn(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> actix::Running {
        self.server_addr.do_send(server::Disconnect {
            user_id: self.user_id,
        });
        actix::Running::Stop
    }
}

impl Handler<server::ChatMessage> for WsChatSession {
    type Result = ();

    fn handle(&mut self, msg: server::ChatMessage, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsChatSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        match msg {
            ws::Message::Ping(msg) => {
                // tracing::info!("Ping received: {:?}", msg);
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            ws::Message::Pong(_) => {
                // tracing::info!("Pong received: {:?}", msg);
                self.hb = Instant::now();
            }
            ws::Message::Text(text) => {
                tracing::info!("WS text: {:?}", text);

                let m = text.trim();

                if m.starts_with('/') {
                    let v: Vec<&str> = m.splitn(2, ' ').collect();
                    match v[0] {
                        "/join" => {
                            let user_id = self.user_id as i64;
                            let chat_id = match v[1].parse::<usize>() {
                                Ok(chat_id) => chat_id as i64,
                                Err(_) => {
                                    ctx.text(format!("Invalid chat id: {}", v[1]));
                                    return;
                                }
                            };

                            self.server_addr
                                .send(server::Join {
                                    user_id: self.user_id,
                                    chat_id: chat_id as usize,
                                })
                                .into_actor(self)
                                .then(move |res, _, ctx| {
                                    match res {
                                        Ok(Ok(_)) => {
                                            tracing::info!(
                                                "User id {} joined chat id {}",
                                                user_id,
                                                chat_id
                                            );
                                            ctx.text(format!("Joined chat id {}", chat_id));
                                        }
                                        Ok(Err(err)) => {
                                            tracing::error!("Error message: {}\n", err);
                                            tracing::error!(
                                                "User id {} failed to join chat id {}",
                                                user_id,
                                                chat_id
                                            );
                                            ctx.text(format!("Failed to join chat. Error message: {}", err));
                                        }
                                        Err(err) => {
                                            tracing::error!("Error message: {}\n", err);
                                            tracing::error!(
                                                "User id {} failed to join chat id {}",
                                                user_id,
                                                chat_id
                                            );
                                            ctx.text("Something went wrong".to_string());
                                        }
                                    }
                                    fut::ready(())
                                })
                                .wait(ctx);

                            // let stuff =check_if_user_id_is_part_of_chat_group(user_id, chat_id, pool.as_ref()).into_actor(self);
                            // // Spawn a new async task to handle the future
                            // stuff.then(
                            //     |res, _, context| { // The `move` keyword is used to move `pool` into the closure.
                            //         match res {
                            //             Ok(is_part_of_chat_group) => {
                            //                 if !is_part_of_chat_group {
                            //                     context.text("You are not part of this chat group".to_string());
                            //                 }
                            //                 // Since pool was moved into the closure, it will be dropped here when no longer needed.
                            //             }
                            //             Err(err) => {
                            //                 tracing::error!("Error message: {}\n", err);
                            //                 context.text("Something went wrong".to_string());
                            //             }
                            //         }
                            //         fut::ready(())
                            //     }
                            // ).spawn(ctx); // Use spawn instead of wait to avoid blocking the actor.
                        }
                        _ => ctx.text(format!("Unknown command: {}", m)),
                    }
                }
            }
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            ws::Message::Continuation(_) => {
                ctx.stop();
            }
            ws::Message::Binary(_) => tracing::warn!("WS: Unexpected binary"),
            ws::Message::Nop => (),
        }
    }
}
