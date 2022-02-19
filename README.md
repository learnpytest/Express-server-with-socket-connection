# Express Server with socket connection

此專案為 Twitter 專案的延伸，開發即時聊天、推播功能所需要的 socket server。資料操作與儲存會用到 MySQL 以及它的 ORM Sequelize

###

# 相關功能的 socket 事件：

1. 連線

- connection

2. 公開聊天室

- allUsers
- allMessages
- message

3. 私人訊息

- getAllUnreadPrivateMessages
- displayAllUnreadPrivateMessages
- afterPrivateMessageSend
- privateMessagesThisRoomAddOne
- afterReadPrivateMessageOfThisRoom

4. 未讀通知

- afterPublicMessageSend
- unreadNotificationPublicMessageAddOne
- displayUnreadNotification
- afterReadPublicMessage
- sendCommunityNotification
- addOneCommunityNotification
- displayUnreadNotification
- afterReadUnreadNotification

## 使用技術與套件：

    "express": "^4.17.1",
    "mysql2": "^2.2.5",
    "sequelize": "^6.16.1",
    "sequelize-cli": "^6.4.1",
    "socket.io": "^3.1.2"

## Project setup

### Prerequisites

Make sure you have installed the following prerequisites:

- Node.js
- Dependencies - Make sure you've installed Node.js and npm first, then install depencies using npm:

$ npm install

## Initializing project

Make sure you've got all prerequisites, then initializing project by node using npm scripts:

$ git clone https://github.com/learnpytest/Express-server-with-socket-connection.git

$ cd Express-server-with-socket-connection

$ npm run install

$ npm run start

```

```
