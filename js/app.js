/** 
 * Twitter Vote Engine 
 * By Montana Flynn
 * http://montanaflynn.me
 */

// Fasten seatbelts and prepare for liftoff, engines are running           
$(function(){

	//////////////////////////////////////////////////////////////////////////////
	// Set up datastores and start collecting tweets
	//////////////////////////////////////////////////////////////////////////////

	// Using persistant json storage Firebase
	var db   = new Firebase('http://gamma.firebase.com/twitter-vote-engine/');
	var ronpaul  = db.child('ronpaul');
	var mittromney = db.child('mittromney');
	
	// Set the feed up forever with a callback
	var feed;
	db.on('value', function(result) {
		feed = result.val();
		$('.init-loading').hide();
	});
	
	// Update data every 30 seconds
	function getTweets(search, limit, db){
		setTimeout(function(){
			var ref = db.name();
			$.ajax({ 
				url: 'http://search.twitter.com/search.json?q='+ search + 
				'&include_entities=true&result_type=recent&rpp='+limit+'&callback=?', 
				dataType: "json", 
				success: function(response){
					$.each(response.results, function(index, result) { 
						db.child(result.id_str).transaction(function(currentTweetData) {
							if (currentTweetData === null) {
								return result;
							}
						});
					});
		    	}, 
				complete: getTweets(search, limit, db)
			});
		}, 10000);
	}
	
	//////////////////////////////////////////////////////////////////////////////
	// Here you set up your queries against twitter and fire away              
	//////////////////////////////////////////////////////////////////////////////
	
	// Ron Paul
	var search = '%23ronpaul';
	var limit = 25;
	getTweets(search, limit, ronpaul);
	
	// Vs. Mitt Romney
	var search = '%23mittromney';
	var limit = 25;
	getTweets(search, limit, mittromney);

		
	//////////////////////////////////////////////////////////////////////////////
	// Callbacks keep the GUI fresh                                              
	//////////////////////////////////////////////////////////////////////////////
		
	ronpaul.on('child_added', function(result) {
	 	var vote = result.val();
		console.log(vote);
		var element = $('#'+ronpaul.name());
		var tweet = vote.text + ' tweeted @' + vote.from_user  + ' on ' + vote.created_at;		
		tweet = twttr.txt.autoLink(tweet, {urlEntities: vote.entities.urls })
		
		element.find('.tweets').prepend(
			'<p class="tweet">'+ tweet +'</p>'
		);
	});
	
	mittromney.on('child_added', function(result) {
	 	var vote = result.val();
		console.log(vote);
		var element = $('#'+mittromney.name());
		var tweet = vote.text + ' tweeted @' + vote.from_user  + ' on ' + vote.created_at;
		tweet = twttr.txt.autoLink(tweet, {urlEntities: vote.entities.urls })
		
		element.find('.tweets').prepend(
			'<p class="tweet">'+ tweet +'</p>'
		);
	});

});