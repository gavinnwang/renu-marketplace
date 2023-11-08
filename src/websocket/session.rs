use std::time::{Duration, Instant};

use actix::{
    fut, prelude::ContextFutureSpawner, Actor, ActorContext, ActorFutureExt, Addr, AsyncContext,
    Handler, StreamHandler, WrapFuture,
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

    // joined room id
    pub room_id: Option<usize>,

    // chat server address to send message
    pub server_addr: Addr<server::ChatServer>,
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
                    }
                    // something is wrong with chat server
                    _ => {
                        tracing::error!("Session actor failed to start: Can not connect to server");
                        ctx.stop();
                    }
                }
                fut::ready(())
            })
            .wait(ctx);
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
                tracing::info!("Ping received: {:?}", msg);
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            ws::Message::Pong(msg) => {
                tracing::info!("Pong received: {:?}", msg);
                self.hb = Instant::now();
            }
            ws::Message::Text(text) => {
                tracing::info!("WS text: {:?}", text);
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
