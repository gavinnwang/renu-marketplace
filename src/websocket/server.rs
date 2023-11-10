use std::{cell::RefCell, collections::HashMap, rc::Rc};

use actix::{
    prelude::ContextFutureSpawner, Actor, Context, Handler, Message, Recipient, ResponseFuture,
    WrapFuture,
};
use actix_web::web::Data;

use crate::{
    model::db_model::DbPool,
    repository::chat_repository::{check_if_user_id_is_part_of_chat_group, insert_chat_message},
};

use super::session;

// chat server manages chat rooms and responsible for coordinating chat session
#[derive(Debug, Clone)]
pub struct ChatServer {
    sessions: Rc<RefCell<HashMap<usize, (Recipient<session::ChatMessageToClient>, Option<usize>)>>>, // maps session id to session address and the room id the session is in
    // rooms: Rc<RefCell<HashMap<usize, HashSet<usize>>>>, // maps room id to set of session ids in the room
    // we don't need rooms because we only have DM and no group chat
    pool: Data<DbPool>,
}

/// Make actor from `ChatServer`
impl Actor for ChatServer {
    /// We are going to use simple Context, we just need ability to communicate
    /// with other actors.
    type Context = Context<Self>;
}

impl ChatServer {
    pub fn new(pool: Data<DbPool>) -> ChatServer {
        ChatServer {
            sessions: Rc::new(RefCell::new(HashMap::new())),
            // rooms: Rc::new(RefCell::new(HashMap::new())),
            pool,
        }
    }
}
// chat message to server

#[derive(Message, Clone)]
#[rtype(result = "()")]
pub struct ChatMessageToServer {
    pub sender_id: usize,
    pub receiver_id: usize,
    pub chat_id: usize,
    pub content: String,
}

impl Handler<ChatMessageToServer> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: ChatMessageToServer, ctx: &mut Self::Context) -> Self::Result {
        let sessions = self.sessions.borrow();

        match sessions.get(&msg.receiver_id) {
            Some((addr, _)) => {
                addr.do_send(session::ChatMessageToClient(msg.content.clone()));
            }
            None => {
                tracing::info!(
                    "Session with id {} isn't registered on chat server. Message not sent over websocket.",
                    msg.receiver_id
                );
            }
        }

        let pool = self.pool.clone();
        async move {
            let result = insert_chat_message(
                msg.sender_id as i32,
                msg.chat_id as i32,
                &msg.content,
                pool.as_ref(),
            )
            .await;

            match result {
                Ok(_) => {
                    tracing::info!("Message inserted to database successfully");
                }
                Err(err) => {
                    tracing::error!("Failed to insert message to databse. Error message: {}\n", err);
                }
            }
        }
        .into_actor(self)
        .spawn(ctx);
    }
}

//  new chat session is created
#[derive(Message)]
#[rtype(result = "()")]
pub struct Connect {
    pub user_id: usize,
    pub addr: Recipient<session::ChatMessageToClient>,
}

impl Handler<Connect> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: Connect, _: &mut Self::Context) -> Self::Result {
        // create a session id using the user_id and add to sessions

        self.sessions
            .borrow_mut()
            .insert(msg.user_id, (msg.addr, None));
    }
}

//  session is disconnected
#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub user_id: usize,
}

impl Handler<Disconnect> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Self::Context) -> Self::Result {
        tracing::info!("Session with id {} disconnected", msg.user_id);

        let mut sessions = self.sessions.borrow_mut();
        // let mut rooms = self.rooms.borrow_mut();

        match sessions.remove(&msg.user_id) {
            Some((_, _)) => (), // if session is not in a room, do nothing
            None => {
                tracing::warn!("Session with id {} does not exist", msg.user_id);
            } // if session does not exist, do nothing. SHOULD NOT HAPPEN
            // if session is in a room, remove the session from the room
            // Some((_, Some(room_id))) => match rooms.get_mut(&room_id) {
            //     Some(room) => {
            //         match room.remove(&room_id) {
            //             // remove session from room
            //             true => {
            //                 // if room is empty, remove room
            //                 if room.is_empty() {
            //                     rooms.remove(&room_id);
            //                     tracing::info!(
            //                         "Room with id {} removed because is now empty",
            //                         room_id
            //                     );
            //                 }
            //             }
            //             false => {
            //                 tracing::warn!(
            //                     "Session with id {} is in a room that does not exist",
            //                     msg.user_id
            //                 );
            //             } // if session is not in room, do nothing. SHOULD NOT HAPPEN
            //         }
            //     }
            //     None => {
            //         tracing::warn!(
            //             "Session with id {} is in a room that does not exist",
            //             msg.user_id
            //         );
            //     } // if room does not exist, do nothing. SHOULD NOT HAPPEN
            // },
        }
    }
}

//  session is disconnected #[derive(Message)]
#[derive(Clone)]
pub struct Join {
    pub user_id: usize,
    pub chat_id: usize,
}

impl actix::Message for Join {
    type Result = Result<usize, String>;
}

impl Handler<Join> for ChatServer {
    type Result = ResponseFuture<Result<usize, String>>;

    fn handle(&mut self, msg: Join, _: &mut Self::Context) -> Self::Result {
        let pool = self.pool.clone();

        // let rooms = self.rooms.clone();
        let sessions = self.sessions.clone();

        // do something async
        Box::pin(async move {
            let is_part_of_chat_group = check_if_user_id_is_part_of_chat_group(
                msg.user_id as i32,
                msg.chat_id as i32,
                pool.as_ref(),
            )
            .await;

            match is_part_of_chat_group {
                Ok(is_part_of_chat_group) => {
                    match is_part_of_chat_group {
                        Some(other_user_id) => {
                            let mut sessions = sessions.borrow_mut();
                            tracing::info!(
                                "user {} is part of chat group {} ",
                                msg.user_id,
                                msg.chat_id
                            );

                            sessions.get_mut(&msg.user_id).unwrap().1 = Some(msg.chat_id);

                            Ok(other_user_id as usize)
                        }

                        None => {
                            tracing::info!(
                                "user {} is not part of chat group {} ",
                                msg.user_id,
                                msg.chat_id
                            );

                            Err("You are not part of this chat group".to_string())
                        }
                    }
                }
                Err(err) => {
                    tracing::error!("Error checking if user is part of chat group: Error message: {}\n", err);

                    Err("Something went wrong".to_string())
                }
            }
        })
    }
}
