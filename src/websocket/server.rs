use std::collections::{HashMap, HashSet};

use actix::{Actor, Context, Handler, Message, Recipient};
use uuid::Uuid;

// chat server manages chat rooms and responsible for coordinating chat session
#[derive(Debug)]
pub struct ChatServer {
    sessions: HashMap<usize, (Recipient<ChatMessage>, Option<Uuid>)>, // maps session id to session address and the room id the session is in
    rooms: HashMap<Uuid, HashSet<usize>>, // maps room id to set of session ids in the room
}

/// Make actor from `ChatServer`
impl Actor for ChatServer {
    /// We are going to use simple Context, we just need ability to communicate
    /// with other actors.
    type Context = Context<Self>;
}

impl ChatServer {
    pub fn new() -> ChatServer {
        ChatServer {
            sessions: HashMap::new(),
            rooms: HashMap::new(),
        }
    }
}

impl ChatServer {
    fn distribute_message_in_room(&self, room_id: usize, message: &str, sender_id: usize) {
        todo!()
    }
}

/// Chat server sends this messages to session
#[derive(Message)]
#[rtype(result = "()")]
pub struct ChatMessage(pub String);

//  new chat session is created
#[derive(Message)]
#[rtype(result = "()")]
pub struct Connect {
    pub user_id: usize,
    pub addr: Recipient<ChatMessage>,
}

impl Handler<Connect> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: Connect, ctx: &mut Self::Context) -> Self::Result {
        // create a session id using the user_id and add to sessions

        self.sessions.insert(msg.user_id, (msg.addr, None));
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

        match self.sessions.remove(&msg.user_id) {
            // if session is in a room, remove the session from the room
            Some((_, Some(room_id))) => match self.rooms.get_mut(&room_id) {
                Some(room) => {
                    match room.remove(&msg.user_id) { // remove session from room
                        true => { // if room is empty, remove room
                            if room.is_empty() {
                                self.rooms.remove(&room_id);
                            } 
                        },
                        false => { 
                            tracing::warn!("Session with id {} is in a room that does not exist", msg.user_id);
                        }, // if session is not in room, do nothing. SHOULD NOT HAPPEN
                    }
                }
                None => { 
                    tracing::warn!("Session with id {} is in a room that does not exist", msg.user_id);
                }, // if room does not exist, do nothing. SHOULD NOT HAPPEN
            },
            Some((_, None)) => (), // if session is not in a room, do nothing
            None => {
                tracing::warn!("Session with id {} does not exist", msg.user_id);
            }, // if session does not exist, do nothing. SHOULD NOT HAPPEN
        }
    }
}
