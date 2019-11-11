var cacheName = "v1";
var cacheFiles = [
	'/',
	'/css/styles.css',
	'/data/restaurants.json',
	'/img/1.jpg',
	'/img/2.jpg',
	'/img/3.jpg',
	'/img/4.jpg',
	'/img/5.jpg',
	'/img/6.jpg',
	'/img/7.jpg',
	'/img/8.jpg',
	'/img/9.jpg',
	'/img/10.jpg',
	'/js/dbhelper.js',
	'/js/main.js',
	'/js/restaurant_info.js',
	'/index.html',
	'/restaurant.html'
];

/**
 * @description Step 2: Add three event listeners for the different states of
 * the service worker: install, activate and fetch.
 *
 * The install event listens for the installation and decides
 * what happens when the service worker is installed successfully or when the
 * installation fails. The square brackets around the [Service Worker] show
 * that the messages come directly from the service worker. */
self.addEventListener('install', function(event) {
	console.log("[Service Worker] Installed");

	/**
	 * @description The install has to wait until the promise within waitUntil()
	 * is resolved
	 */
	event.waitUntil(
		/**
		 * @description Step 4: The browser opens the caches corresponding to the
		 * cacheName and adds all the files of the array "cacheFiles".
		 */
		caches.open(cacheName).then(function(cache) {
			console.log("[Service Worker] Caching cacheFiles");
			return cache.addAll(cacheFiles);
		})
	)
})

/**
 * @description Activate the service worker and listen for the activation.
 */
self.addEventListener('activate', function(event) {
	console.log("[Service Worker] Activated");

	event.waitUntil(
		/**
		 * @description Loop through all the keys of the caches to compare them
		 * later.
		 */
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(function(thisCacheName) {
				/**
				 * @description Compare the cache names. If they are not equal, delete
				 * the old caches to update the cache with the new caches.
				 */
				if (thisCacheName !== cacheName) {
					console.log("[Service Worker] Removing Cached Files from", thisCacheName);
					return caches.delete(thisCacheName);
				}
			}))
		})
	)
})

/**
 * @description Fetch the data from the given URL.
 */
self.addEventListener('fetch', function(event) {
	console.log("[Service Worker] Fetching", event.request.url);
	/**
	 * @description Check in the cache if the cached URL/file and the requested
	 * URL/file match. Then respond appropriately to the outcome.
	 */
	
	event.respondWith(

		// check for a match to the request in the cache
		// {ignorSearch: true} A Boolean that specifies whether to ignore the query string in the URL.  For example, if set to true the ?value=bar part of http://foo.com/?value=bar would be ignored when performing a match. It defaults to false.
		caches.match(event.request, {ignoreSearch: true}).then(response => {
	
		  // if the data already exists in the cache
		  if (response) {
	
			// log to the console that we found a match and what is was we found
			// console.log('Found response in cache:', response);
	
			// return the data we found in the cache
			return response;
		  }
	
		  // if we didn't find a match, then log to the console that this is something new and we need to go get it from the network
		  // console.log('No response found in cache. About to fetch from network...');
	
		  // Fetch it from the network
		  return fetch(event.request).then(response => {
			// log to the console what we got from the network
			// console.log('Response from network is:', response);
	
			// since it wasn't found in the cache, lets just add it now
			return caches.open(cacheName).then(cache => {
			  cache.put(event.request, response.clone());
	
			  // now return what we fetched to the page
			  return response;
			});
	
	
	
			// on network error
		  }).catch(err => {
			// console.error('Fetching failed:', err);
	
			throw err;
		  });
		})
	  );
});