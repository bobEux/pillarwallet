// @flow
import ChatService from 'services/chat';
import Toast from 'components/Toast';
import {
  UPDATE_CHATS,
  ADD_MESSAGE,
  UPDATE_MESSAGES,
  RESET_UNREAD_MESSAGE,
  FETCHING_CHATS,
  DELETE_CHAT,
} from 'constants/chatConstants';
import { prepareWebSocketRequest } from 'utils/chat';

const chat = new ChatService();

const mergeNewChats = (newChats, existingChats) => {
  return Object.keys(newChats)
    .filter(_username => !existingChats.find(({ username }) => _username === username))
    .map(_username => ({
      lastMessage: {
        content: '',
        username: _username,
        device: 1,
        serverTimestamp: newChats[_username].latest,
        savedTimestamp: 0,
      },
      username: _username,
      unread: newChats[_username].count,
    }))
    .concat(existingChats);
};

export const getExistingChatsAction = () => {
  return async (dispatch: Function) => {
    const chats = await chat.client.getExistingMessages('chat').then(JSON.parse).catch(() => []);
    const filteredChats = chats.filter(_chat => !!_chat.lastMessage && !!_chat.username);
    const {
      unread: unreadChats = {},
    } = await chat.client.getUnreadMessagesCount('chat').then(JSON.parse).catch(() => ({}));
    const newChats = mergeNewChats(unreadChats, filteredChats);

    const augmentedChats = newChats.map(item => {
      const unread = unreadChats[item.username] ? unreadChats[item.username].count : 0;
      const lastMessage = item.lastMessage || {};
      if (unreadChats[item.username]) lastMessage.serverTimestamp = unreadChats[item.username].latest;
      return { ...item, unread, lastMessage };
    });

    dispatch({
      type: UPDATE_CHATS,
      payload: augmentedChats,
    });
  };
};

export const resetUnreadAction = (username: string) => ({
  type: RESET_UNREAD_MESSAGE,
  payload: { username },
});

export const sendMessageByContactAction = (username: string, userId: string, message: Object) => {
  return async (dispatch: Function, getState: Function) => {
    const {
      accessTokens: { data: accessTokens },
    } = getState();
    const connectionAccessTokens = accessTokens.find(({ userId: connectionUserId }) => connectionUserId === userId);
    if (!Object.keys(connectionAccessTokens).length) {
      return;
    }
    const { userAccessToken: userConnectionAccessToken } = connectionAccessTokens;
    try {
      if (chat.isWebSocketRunning()) {
        const chatWebSocket = chat.getWebSocketInstance();
        chat.client.encryptWebSocketMessageByContact(username, message.text, 'chat').then((request) => {
          chatWebSocket.send(prepareWebSocketRequest(request));
        }).catch(() => null);
      } else {
        await chat.client.sendMessageByContact('chat', {
          username,
          userId,
          userConnectionAccessToken,
          message: message.text,
        });
      }
    } catch (e) {
      Toast.show({
        message: 'Unable to contact the server',
        type: 'warning',
        title: 'Cannot send the message',
        autoClose: false,
      });
      return;
    }

    const timestamp = new Date(message.createdAt).getTime();
    const msg = {
      _id: timestamp.toString(),
      createdAt: timestamp,
      text: message.text,
      user: {
        _id: message.user._id,
        name: message.user._id,
      },
    };

    dispatch({
      type: ADD_MESSAGE,
      payload: { message: msg, username },
    });
  };
};

export const getChatByContactAction = (username: string, avatar: string, loadEarlier: boolean = false) => {
  return async (dispatch: Function) => {
    dispatch({
      type: FETCHING_CHATS,
    });
    await chat.client.addContact(username).catch(e => {
      if (e.code === 'ERR_ADD_CONTACT_FAILED') {
        Toast.show({
          message: e.message,
          type: 'warning',
          title: 'Cannot retrieve remote user',
          autoClose: false,
        });
      }
    });
    if (loadEarlier) {
      // TODO: split message loading in bunches and load earlier on lick
    }
    await chat.client.receiveNewMessagesByContact(username, 'chat').catch(() => null);
    const receivedMessages = await chat.client.getMessagesByContact(username, 'chat')
      .then(JSON.parse).catch(() => []);

    const updatedMessages = await receivedMessages.map((message, index) => ({
      _id: `${message.serverTimestamp}_${index}`,
      text: message.content,
      createdAt: new Date(message.serverTimestamp),
      status: message.status,
      type: message.type,
      user: {
        _id: message.username,
        name: message.username,
        avatar,
      },
    })).sort((a, b) => b.createdAt - a.createdAt);

    dispatch({
      type: UPDATE_MESSAGES,
      payload: { messages: updatedMessages, username },
    });
  };
};

export const deleteChatAction = (username: string) => {
  return (dispatch: Function) => {
    chat.client.deleteContactMessages(username, 'chat').then(() => {
      dispatch({
        type: DELETE_CHAT,
        payload: username,
      });
    }).catch(() => null);
  };
};

export const parseWebSocketMessageAction = (message: Object) => {
  return () => {
    chat.client.decodeWebSocketMessage(message).then(() => {
      if (!Object.keys(message).length) return;
      console.log('parseWebSocketMessageAction', message);
    }).catch(() => null);
  };
};
