const URI = 'http://blackops.dev'

// require express
var express = require('express')
var path = require('path')
var axios = require('axios')

// create our router object
var router = express.Router()

// export our router
module.exports = router

var WPAPI = require('wpapi')
var wp = new WPAPI({
	endpoint: URI + '/wp-json/'
})

var functions = require("./functions.js")

// route for our homepage
router.get('/', function(req, res) {
	Promise.all([functions.getPage(2), functions.getLatestPost()]).then(function(data) {
		console.info(data[0])
		res.render('pages/home', {
			post: data[0],
			latestpost: data[1][0],
			casestudies: data[2]
		})
	})
})

// route for our case studies archive page
router.get('/case-studies', function(req, res) {
	Promise.all([functions.getCustomPostType(6)]).then(function(data) {
		let pageData = {
			posts: data[0]
		}
		res.render('pages/cpt-archive', pageData)
	})
})

// route for our single case study page
router.get('/case-studies/*', function(req, res) {
	let target = req.url.split('/')[2]
	Promise.all([functions.getCaseStudy(target)]).then(function(data) {
		// console.info(data)
		res.render('pages/cpt-single', {
			post: data[0][0]
		})
	})
})

router.param('page_number', function(req, res, next, page_number) {
	let target = req.url.split('/')

	let filteredcategory = res.app.settings['categories'].filter((category) => {
		// console.log((category.slug === target[2]) ? category : 'no match')
		return category.slug === target[2]
	})

	if (filteredcategory.length > 0) {
		console.log("greater than zero", filteredcategory.length)
		wp.posts().categories(filteredcategory[0].id).perPage(9).page(page_number).embed().then(function(data) {

			let pageData = {
				isCategory: true,
				isSearch: false,
				thiscategory: filteredcategory[0],
				categories: res.app.settings['categories'],
				posts: data
			}

			res.render('pages/archive', pageData)

		})

	} else {

		Promise.all([functions.getPosts(page_number)]).then(function(data) {

			let pageData = {
				isCategory: false,
				isSearch: true,
				thiscategory: null,
				categories: res.app.settings['categories'],
				posts: data[0],
				featuredposts: null
			}

			res.render('pages/archive', pageData)

		})
	}

	next()
})

router.get('/*/page/:page_number', function(req, res, next) {
	console.log('pagination')
	next()
})

// This is our post archive
router.get('/insights', function(req, res) {
	// console.log("RES APP SETTINGS - categories\n", res.app.settings['categories'])

	Promise.all([functions.getPosts(1), functions.getFeaturedPosts()]).then(function(data) {

		let pageData = {
			categories: res.app.settings['categories'],
			posts: data[0]
		}

		// console.log("Data from promises\n", pageData)
		res.render('pages/archive', pageData)
	})

})

router.get('/insights/*', function(req, res) {
	let target = req.url.split('/')

	let filteredcategory = res.app.settings['categories'].filter((category) => {
		return category.slug === target[2]
	})

	let getCategoryPage = (page_number) => {
		wp.categories().slug(target[2]).then(function(cats) {

			return wp.posts().perPage(9).page(page_number).categories(cats[0].id).embed()

		}).then(function(data) {

			let pageData = {
				isCategory: true,
				isSearch: false,
				thiscategory: filteredcategory[0],
				categories: res.app.settings['categories'],
				posts: data
			}

			res.render('pages/archive', pageData)

		}).catch(function(err) {
			console.error(err)
			res.render('pages/dump', {
				text: err
			})
		})
	}

	let getSinglePage = () => {
		Promise.all([functions.getSinglePost(target[2]), functions.getRelatedPosts(target[2], res)]).then(function(data) {
			// console.log("Data from promises\n", data)
			const moment = require('moment');
			let content = data[0].content.rendered
			let contentArr = content.split(' ')
			let pageData = {
				meta: {
					postdate: moment(data[0].date).format('dddd Do MMMM YYYY'),
					readingtime: ~~(contentArr.length / 200)
				},
				post: data[0],
				relatedposts: data[1]
			}

			res.render('pages/single', pageData)

		}).catch(function(err) {
			console.error(err)
			res.render('pages/dump', {
				text: err
			})
		})
	}

	if (filteredcategory.length > 0) {
		getCategoryPage(1)
	} else {
		getSinglePage()
	}

})

// Search
router.param('search', function(req, res, next, search_term) {
	Promise.all([functions.getSearchResult(search_term)]).then(function(data) {
		res.render('pages/archive', {
			isCategory: false,
			isSearch: search_term,
			thiscategory: null,
			categories: res.app.settings['categories'],
			posts: data[0]
		})
	})
})

router.get('/search/:search', function(req, res, next) {
	console.log('search results')
	next()
})

// everything else
router.get('/contact', function(req, res) {

	wp.pages().slug('contact').embed().then(function(data) {
		// log for debug
		//console.log("PAGE DATA: \n", data)

		let apiKey = 'b857475871'
		let sig = 'AIXjdqyIUmo30G5RZOwPfKP6cLg%3D'
		let expiry = 1497577310
		let formId = 5
		let gfendpoint = URI + '/gravityformsapi/forms/' + formId + '?api_key=' + apiKey + '&signature=' + sig + '&expires=' + expiry

		axios.get(gfendpoint).then((response) => {
			if (response.data.status > 200) {
				console.error('Gravity Forms', response.data.status, response.data.response, response)
			} else {
				// console.log('Gravity Forms', response)
				let forms = [{
						title: data[0].acf.contact_portal_1_title,
						body: data[0].acf.contact_portal_1_body,
						buttontext: data[0].acf.contact_portal_1_button_text,
						container: 'form_container_1',
						theme: 'contact-work',
						fields: response.data.response.fields,
						button: response.data.response.button.text,
						id: response.data.response.id
					},
					{
						title: data[0].acf.contact_portal_2_title,
						body: data[0].acf.contact_portal_2_body,
						buttontext: data[0].acf.contact_portal_2_button_text,
						container: 'form_container_2',
						theme: 'contact-career',
						fields: [],
						button: null,
						id: null
					},
					{
						title: data[0].acf.contact_portal_3_title,
						body: data[0].acf.contact_portal_3_body,
						buttontext: data[0].acf.contact_portal_3_button_text,
						container: 'form_container_3',
						theme: 'contact-hello',
						fields: [],
						button: null,
						id: null
					}
				]

				res.render('pages/contact', {
					forms: forms,
					post: data[0]
				})
			}
		})

	}).catch(function(err) {
		// handle error
		console.error(err)

	})
})

// everything else
router.get('/*', function(req, res) {
	let target = req.url.split('/')[1]

	wp.pages().slug(target).embed().then(function(data) {

		let template = data[0].template.split('.')[0] || 'plain-text'

		res.render('pages/' + template, {
			post: data[0]
		})

	}).catch(function(err) {
		console.error(err)
		res.render('pages/dump', {
			text: err
		})
	})
})
