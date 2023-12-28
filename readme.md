todo:

1. notification for chats   [*]
2. num of unread chats    [*]
3. ai completetion   
4. aws centralized logging
5. check home icon to scroll to top [*]
6. use uesr error for better error handling
7. improve websocket server data structure => use a hashmap instead that maps user id to addr and remove join and leave message. when user send message just check if user is part of room and get the other user in the room and send message to other user 
8. in loding page fetch 4 items each for each category 40~ items and then put them in respective query keys to reduce the need of a lot fo concurrent calls

backlog:

1. chat message efficiency and consistency: https://towardsdatascience.com/ace-the-system-interview-design-a-chat-application-3f34fd5b85d0 
