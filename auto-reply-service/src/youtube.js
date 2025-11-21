const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

let oauth2Client;
function createOAuthClient() {
  if (oauth2Client) return oauth2Client;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
  oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const refreshToken = process.env.REFRESH_TOKEN;
  if (refreshToken) oauth2Client.setCredentials({refresh_token: refreshToken});

  oauth2Client.on && oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.log(new Date().toISOString(), '[TOKEN] New refresh token received.');
    }
    if (tokens.access_token) {
      console.log(new Date().toISOString(), '[TOKEN] Access token refreshed.');
    }
  });

  return oauth2Client;
}

function getYoutubeClient() {
  const auth = createOAuthClient();
  return google.youtube({version: 'v3', auth});
}

async function listCommentsForVideo(videoId, pageToken = null) {
  const youtube = getYoutubeClient();
  const res = await youtube.commentThreads.list({
    part: 'snippet',
    videoId,
    maxResults: 100,
    pageToken,
    textFormat: 'plainText'
  });
  return res.data;
}

async function listCommentsForChannel(channelId, pageToken = null) {
  const youtube = getYoutubeClient();
  const res = await youtube.commentThreads.list({
    part: 'snippet',
    allThreadsRelatedToChannelId: channelId,
    maxResults: 100,
    pageToken,
    textFormat: 'plainText'
  });
  return res.data;
}

async function replyToComment(parentCommentId, text) {
  const youtube = getYoutubeClient();
  const res = await youtube.comments.insert({
    part: 'snippet',
    requestBody: {
      snippet: {
        parentId: parentCommentId,
        textOriginal: text
      }
    }
  });
  return res.data;
}

module.exports = {
  createOAuthClient,
  getYoutubeClient,
  listCommentsForVideo,
  listCommentsForChannel,
  replyToComment
};
