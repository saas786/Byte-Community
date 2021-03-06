const express = require('express');
const api = express.Router();
const axios = require('axios');
const slowDown = require('express-slow-down');

const ByteApi = require('../utils/Api');

// auth tokens that are used to authenticate Byte API requests
const authorizationTokens = ['']; // TODO: add your own authorization tokens

const getAuthorizationToken = getNextAuthorizationToken(authorizationTokens);

// limit proxy API requests to prevent scripted abuse that would impact the performance of the web app
const speedLimiter = slowDown({
	windowMs: 5 * 1000, // 5 seconds
	delayAfter: 5, // allow 5 requests per 5 seconds, then...
	delayMs: 3000 // begin adding 3000ms of delay per request above 5
});

// only apply limiter to requests that begin with /api/
api.use('/api/', speedLimiter);

// set Authorization header on all API requests
api.all('/api/*', function(req, res, next) {
	const {
		headers: { authorization }
	} = req;

	setAuthorizationToken(authorization);

	next();
});

api.get('/api/getUser', async function(req, res) {
	const userId = req.query.userId;

	const response = await ByteApi.getUser(userId);

	const { data } = response;

	res.send(data);
});

api.get('/api/searchUser', async function(req, res) {
	const { query } = req.query;

	const response = await ByteApi.searchUser(query);

	const { data } = response;

	res.send(data);
});

api.get('/api/getUserPosts', async function(req, res) {
	const { username, cursor } = req.query;

	const response = await ByteApi.getUserPosts(username, cursor);

	const { data } = response;

	res.send(data);
});

api.get('/api/getUserRebytes', async function(req, res) {
	const { username, cursor } = req.query;

	const response = await ByteApi.getUserRebytes(username, cursor);

	const { data } = response;

	res.send(data);
});

api.get('/api/getPost', async function(req, res) {
	const { id } = req.query;

	const response = await ByteApi.getPost(id);

	const { data, error } = response;

	res.send(error ? response : data);
});

api.get('/api/getPostComments', async function(req, res) {
	const { id, cursor } = req.query;

	const response = await ByteApi.getPostComments(id, cursor);

	const { data } = response;

	res.send(data);
});

api.get('/api/getPostLikes', async function(req, res) {
	const { id, cursor } = req.query;

	const response = await ByteApi.getPostLikes(id, cursor);

	const { data } = response;

	res.send(data);
});

api.get('/api/getTimeline', async function(req, res) {
	return await getFeed(req, res, ByteApi.getTimeline);
});

api.get('/api/getPopularFeed', async function(req, res) {
	return await getFeed(req, res, ByteApi.getPopularFeed);
});

api.get('/api/getPopular2Feed', async function(req, res) {
	return await getFeed(req, res, ByteApi.getPopular2Feed);
});

api.get('/api/getLatestFeed', async function(req, res) {
	return await getFeed(req, res, ByteApi.getLatestFeed);
});

api.get('/api/getMixFeed', async function(req, res) {
	return await getFeed(req, res, ByteApi.getMixFeed);
});

api.get('/api/getActivity', async function(req, res) {
	return await getFeed(req, res, ByteApi.getActivity);
});

api.get('/api/getPicksFeed', async function(req, res) {
	const { pickId, cursor } = req.query;

	const response = await ByteApi.getPicksFeed(pickId, cursor);

	const { data } = response;

	res.send(data);
});

async function getFeed(req, res, apiMethod) {
	const { cursor } = req.query;

	const response = await apiMethod(cursor);

	const { data } = response;

	res.send(data);
}

api.get('/api/getCategoryFeed', async function(req, res) {
	const { categoryName, sort, cursor } = req.query;

	const response = await ByteApi.getCategoryFeed(categoryName, sort, cursor);

	const { data } = response;

	res.send(data);
});

api.get('/api/getExploreCategories', async function(req, res) {
	const response = await ByteApi.getExploreCategories();

	const { data } = response;

	res.send(data);
});

api.get('/api/getMe', async function(req, res) {
	const response = await ByteApi.getMe();

	const { data } = response;

	res.send(data);
});

api.post('/api/authenticate', async function(req, res) {
	const { code: googleCode } = req.body;

	const response = await ByteApi.authenticate(googleCode);

	const { data } = response;

	res.send(data);
});

api.post('/api/register', async function(req, res) {
	const { username, token: googleToken } = req.body;

	const response = await ByteApi.register(username, googleToken);

	const { data } = response;

	res.send(data);
});

api.post('/api/likePost', async function(req, res) {
	const { postId } = req.body;

	const response = await ByteApi.likePost(postId, true);

	const { data } = response;

	res.send(data);
});

api.post('/api/unlikePost', async function(req, res) {
	const { postId } = req.body;

	const response = await ByteApi.likePost(postId, false);

	const { data } = response;

	res.send(data);
});

api.post('/api/followUser', async function(req, res) {
	const { userId } = req.body;

	const response = await ByteApi.followUser(userId, true);

	const { data } = response;

	res.send(data);
});

api.post('/api/unfollowUser', async function(req, res) {
	const { userId } = req.body;

	const response = await ByteApi.followUser(userId, false);

	const { data } = response;

	res.send(data);
});

api.post('/api/postComment', async function(req, res) {
	const { postId, comment } = req.body;

	const response = await ByteApi.postComment(postId, comment);

	const { data } = response;

	res.send(data);
});

api.post('/api/deleteComment', async function(req, res) {
	const { commentId } = req.body;

	const response = await ByteApi.deleteComment(commentId);

	const { data } = response;

	res.send(data);
});

function setAuthorizationToken(authorization) {
	// if the user is authenticated use their auth token else use a token supplied by round-robin iteration
	const authorizationToken = authorization
		? authorization
		: getAuthorizationToken();
	axios.defaults.headers.common['Authorization'] = authorizationToken;
}

// returns the next token in the round-robin iteration
function getNextAuthorizationToken(authorizationTokens) {
	let currentTokenIndex = 0;
	return function() {
		if (currentTokenIndex >= authorizationTokens.length) currentTokenIndex = 0;
		return authorizationTokens[currentTokenIndex++];
	};
}

module.exports = api;
