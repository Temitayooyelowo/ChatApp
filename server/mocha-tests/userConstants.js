const INVALID_USER_ID = '5b689cf0cfbe3d5088992af6';

const INVALID_NAME = 'Loiuo Ongioi';

const USER_WITHOUT_EMAIL = {
  id: '1',
  displayName: 'User without email',
  emails: ''
}

const CHATROOM_INITIAL = '';

const CHATROOM_TEST_NAME = 'Test Chatroom';
const SECOND_TEST_CHATROOM = 'Second Test Chatroom';

const INVALID_CHATROOM_TEST_NAME = 'Invalid Chatroom';

const TEST_MESSAGE_TEXT = [
  'Hey! What\'s up?',
  'I\'m good you?'
]

const USER_WITH_EMAIL = {
  id: '2',
  displayName: 'User with email',
  emails: [{value: 'test@gmail.com'}]
}

const ACCESS_TOKEN = '1234';

module.exports = {
  USER_WITHOUT_EMAIL,
  USER_WITH_EMAIL,
  CHATROOM_INITIAL,
  CHATROOM_TEST_NAME,
  ACCESS_TOKEN,
  TEST_MESSAGE_TEXT,
  INVALID_CHATROOM_TEST_NAME,
  INVALID_USER_ID,
  SECOND_TEST_CHATROOM
};
