const URI = 'http://blackops.dev'

var WPAPI = require('wpapi')
var wp = new WPAPI({
	endpoint: URI + '/wp-json/'
})

wp.customPostType = wp.registerRoute('wp/v2', '/casestudy/(?P<id>)')

exports.getPage = function(page_id) {
	return wp.pages().id(page_id).embed().then(function(data) {
		return data
	})
}

exports.getLatestPost = function() {
	return wp.posts().perPage(1).embed().then(function(data) {
		return data
	})
}

exports.getCustomPostType = function(cs_count) {
	return wp.customPostType().perPage(cs_count).embed().then(function(data) {
		return data
	})
}

exports.getCaseStudy = function(post_slug) {
	return wp.customPostType().slug(post_slug).embed().then(function(data) {
		return data
	})
}

exports.getPosts = function(page_number) {
	return wp.posts().perPage(9).page(page_number).embed().then(function(data) {
		return data
	})
}

exports.getSearchResult = function(search_term){
	return wp.posts().search(search_term).embed().then(function(data) {
		return data
	})
}

exports.getSinglePost = function(target) {
	return wp.posts().slug(target).embed().then(function(data) {
		return data[0]
	}).catch(function(err) {
		console.error(err)
	})
}

exports.getFeaturedPosts = function() {
	// @TODO: This needs to be fixed. Find a way to recover ONLY the featured posts
	return wp.posts().embed().then(function(data) {
		return data
	})
}

exports.getRelatedPosts = function(target, res) {
	// @TODO: These are NOT actually related - grabbing 6 from a random category
	// probably need to sort this out :/

	let catId = res.app.settings['categories'][randomNumber(0, res.app.settings['categories'].length)].id

	return wp.posts().perPage(6).categories(catId).embed().then(function(data) {
		return data
	}).catch(function(err) {
		console.error(err)
	})
}

exports.getJobs = function(){
    return wp.jobs().embed().then(function(data) {
		return data
	})
}

exports.getJob = function(post_slug){
    return wp.jobs().slug(post_slug).embed().then(function(data) {
		return data
	})
}

let randomNumber = (min, max) => {
	return Math.floor(Math.random() * max) + min
}
