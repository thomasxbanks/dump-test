# Cube3 Node/WordPress Boilerplate

Using Node.js and EJS templating to generate static HTML from WordPress API > :shipit:

## Requirements
- [Node.js](https://nodejs.org/en/)
- [WordPress >4.7](https://wordpress.org/news/2016/12/vaughan/) or [WP-API Plugin](https://github.com/WP-API/WP-API) (for WordPress <4.7)

## Installation
1. `git clone` the repo
1. `npm install` the dependencies
1. `npm start` to fire up the express server once you have completed _Set up_ below

## Set-up
1. Install the [ACF to REST API](http://github.com/airesvsg/acf-to-rest-api) plugin to WordPress
1. Expose any custom post types to the API - `show_in_rest => true`
1. Enable the __Gravity Forms__ API access (see screenshot below)
1. Point your build at the right WordPress site - `const URI = 'http://yoursite.com'`

![gravity Forms API Settings](/_docs/gravity-forms-api-settings.png)

## Commands
- `npm start` - Boot up the server and watch for changes
- `npm test` - Runs tests when/if any are put in

## Documentation
- [Node.js](https://nodejs.org/en/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.
- [ExpressJS Server](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [EJS](http://www.embeddedjs.com/) - EJS combines data and a template to produce HTML
- [WordPress REST API Docs](http://v2.wp-api.org/) - Access your WordPress site's data through an easy-to-use HTTP REST API
- [wpapi](https://www.npmjs.com/package/wpapi#collection-pagination) - A WordPress REST API client for JavaScript
- [ACF to REST API](http://github.com/airesvsg/acf-to-rest-api) - Exposes Advanced Custom Fields Endpoints in the WP REST API v2

## Go nuts!
Compatible [Plugins](http://v2.wp-api.org/guide/plugins/) on the WordPress.org Plugin Repository.

> While WordPress REST API v2 is still in plugin form, most of these plugins use it as a dependency, as opposed to the core infrastructure introduced in WordPress 4.4, so make sure you have it installed and activated.

_____

## Example code

Some basic code is included in this boilerplate for you to extend and modify
but here are some easy-to-understand examples of how the code will look.

### Exposing custom post types
```php
<?php
  add_action( 'init', 'casestudy' );

  function casestudy() {
    $args = array(
      'public'       => true,
      'show_in_rest' => true,
      'label'        => 'Case Studies'
    );
    register_post_type( 'casestudy', $args );
  }
?>
```

### EJS template
```html
<% for (post of posts) { %>
  <article class="card">
    <% if (post['_embedded']['wp:featuredmedia']) { %>
      <img class="hero_image" src="<%- post['_embedded']['wp:featuredmedia'][0].source_url %>" alt="<%- post.title.rendered %>">
    <% } %>
    <h2><%- post.title.rendered %></h2>
    <%- post.excerpt.rendered %>
    <a href="/insights/<%- post.slug %>" class="button">Read more</a>
  </article>
<% } %>
```

### Express Routing
```js
// route for our homepage
router.get('/', function(req, res) {
  Promise.all([functions.getPage(2), functions.getLatestPost()]).then(function(data) {
    res.render('pages/home', {
      post: data[0],
      latestpost: data[1][0]
    })
  })
})
```

### WordPress API get
```js
exports.getPosts = function(page_number) {
  return wp.posts().perPage(9).page(page_number).embed().then(function(data) {
    return data
  })
}
```

_____

## Next steps
- [ ] Sanitise response data into nicer variables
  - Replace `<%- post['_embedded']['wp:featuredmedia'][0].source_url %>` with something like `<%- post.hero_image.url %>`
- [ ] Get custom **Options** pages from the CMS
- [ ] `POST` to Gravity Forms
- [ ] Deal with responses from Gravity Forms on return from `POST`
- [ ] Set up auth for continuous access to Gravity Forms
- [ ] Return posts based on meta-data, especially custom ACF meta-data
  - This would make things like `post.acf.is_featured` better. Currently bringing in all posts and only displaying the ones where `casestudy.acf.is_featured` is `true`
- [ ] Get this POC working on a server :/
- [ ] Look at integrating things like vue.js, third-party code, `Gulp`ing the stylesheet
- [ ] Get Gravity Forms API working in ExpressJS to avoid using Axios or jQuery to AJAX the data
- [ ] Look into using Node File System to write static files to the server.
  - Included in this is re-generating the static files when the API is updated by the CMS

## Bugs
- [ ] Pagination for top-level pages breaks :cry:
  - :heavy_check_mark: `http://yoursite.com/blog/category/page/2`
  - :heavy_multiplication_x: `http://yoursite.com/blog/page/2`

_____

## Contribution
Any recommendations on improvements/changes welcome.
