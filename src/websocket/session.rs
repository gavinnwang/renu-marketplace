use std::time::{Duration, Instant};

use actix::{
    fut, prelude::ContextFutureSpawner, Actor, ActorContext, ActorFutureExt, Addr, AsyncContext,
    Handler, Message, StreamHandler, WrapFuture,
};
use actix_web_actors::ws;

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

    // joined room id and other user id in the room
    pub chat_id_and_other_user_id: Option<(usize, usize)>,

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

/// Chat server sends this messages to session
#[derive(Message)]
#[rtype(result = "()")]
pub struct ChatMessageToClient(pub String);

impl Handler<ChatMessageToClient> for WsChatSession {
    type Result = ();

    fn handle(&mut self, msg: ChatMessageToClient, ctx: &mut Self::Context) {
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
                    let v: Vec<&str> = m.splitn(3, ' ').collect();
                    match v[0] {
                        "/join" => {
                            let user_id = self.user_id as i32;
                            // check for index out of bounds

                            let chat_id = match v.get(1) {
                                Some(chat_id) => *chat_id,
                                None => {
                                    ctx.text("Join command requires chat id".to_string());
                                    tracing::error!("Join command requires chat id.");
                                    return;
                                }
                            };
                            let chat_id = match chat_id.parse::<usize>() {
                                Ok(chat_id) => chat_id,
                                Err(_) => {
                                    ctx.text(format!("Invalid chat id: {}", chat_id));
                                    tracing::error!("Invalid chat id: {}", chat_id);
                                    return;
                                }
                            };

                            self.server_addr
                                .send(server::Join {
                                    user_id: self.user_id,
                                    chat_id,
                                })
                                .into_actor(self)
                                .then(move |res, act, ctx| {
                                    match res {
                                        Ok(Ok(other_user_id)) => { 
                                            tracing::info!(
                                                "User id {} joined chat id {}",
                                                user_id,
                                                chat_id
                                            );
                                            // ctx.text(format!("Joined chat id {}", chat_id));

                                            act.chat_id_and_other_user_id =
                                                Some((chat_id, other_user_id));
                                        }
                                        Ok(Err(err)) => { 
                                            tracing::warn!(
                                                "User id {} failed to join chat id {}, error message: {}",
                                                user_id,
                                                chat_id,
                                                err
                                            );
                                            ctx.text("Something went wrong");
                                        }
                                        Err(err) => {
                                            tracing::error!(
                                                "User id {} failed to join chat id {}, error message: {}",
                                                user_id,
                                                chat_id,
                                                err
                                            );
                                            ctx.text("Something went wrong");
                                        }
                                    }
                                    fut::ready(())
                                })
                                .spawn(ctx);
                        }
                        "/message" => match self.chat_id_and_other_user_id {
                            Some((chat_id, other_user_id)) => {
                                match v.get(1) {
                                    Some(id) => {
                                        if id != &chat_id.to_string() {
                                            ctx.text("Error: chat id mismatch!");
                                            tracing::error!("Chat id mismatch expected id {chat_id} but got id {id}");
                                            return;
                                        }
                                    }
                                    None => {
                                        ctx.text("Message command requires chat id");
                                        tracing::error!("Mssage command requires chat id");
                                        return;
                                    }
                                };
                                let content = match v.get(2) {
                                    Some(content) => (*content).to_string(),
                                    None => {
                                        ctx.text("Message command requires content");
                                        tracing::error!("Message command requires content");
                                        return;
                                    }
                                };

                                self.server_addr
                                    .send(server::ChatMessageToServer {
                                        sender_id: self.user_id,
                                        receiver_id: other_user_id,
                                        chat_id,
                                        content,
                                    })
                                    .into_actor(self)
                                    .then(move |res, act, ctx| {
                                        match res {
                                            Ok(()) => {
                                                tracing::info!(
                                                    "User id {} sent message to chat id {chat_id}",
                                                    act.user_id
                                                );
                                            }
                                            Err(err) => {
                                                tracing::error!(
                                                "User id {} failed to send message to chat id {chat_id}, error message: {err}",
                                                act.user_id
                                            );
                                                ctx.text("Something went wrong");
                                            }
                                        }
                                        fut::ready(())
                                    })
                                    .spawn(ctx);
                            }
                            None => {
                                tracing::warn!(
                                    "User id {} is not part of any chat group",
                                    self.user_id
                                );
                                ctx.text("You are not part of any chat group");
                            }
                        },
                        _ => ctx.text(format!("Unknown command: {}", m)),
                    }
                } else {
                    tracing::warn!("WS: Unexpected command");
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
