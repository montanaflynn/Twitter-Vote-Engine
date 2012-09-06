/** 
 * Twitter Vote Engine 
 * By Montana Flynn
 * http://montanaflynn.me
 *
 * License & Warranty: https://twitter.com/montanaflynn/status/237424754640949249
 *
 */

$(function(){

	//////////////////////////////////////////////////////////////////////////////
	// Set up datastores and start collecting tweets
	//////////////////////////////////////////////////////////////////////////////

	// Using persistant json storage Firebase
	var db   	 	= new Firebase('http://gamma.firebase.com/twitter-vote-engine/');
	var db_scope    = db.limit(100);
	
	var ronpaul   	= db.child('ronpaul');
	var mittromney  = db.child('mittromney');	
	
	// Set the feed up forever with a callback
	var feed;
	
	// Add Vote Count Badge
	$('.poll header .btn').append('<span class="badge badge-inverse hide"></span>');

	db_scope.on('value', function(result) {
		$('.loading').hide();
		feed = result.val();
		
		_.each(feed, function(value, key){ 
			$('#'+key+' header .badge').html(_.size(value)).show();
		});
		
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
		}, 30000);
	}
	
	//////////////////////////////////////////////////////////////////////////////
	// Here you set up your queries against twitter and fire away              
	//////////////////////////////////////////////////////////////////////////////
	
	// Ron Paul
	var search = '%23ronpaul';
	var limit = 100;
	getTweets(search, limit, ronpaul);
	
	// Vs. Mitt Romney
	var search = '%23mittromney';
	var limit = 100;
	getTweets(search, limit, mittromney);

		
	//////////////////////////////////////////////////////////////////////////////
	// Update the GUI and keep it fresh with callbacks                                       
	//////////////////////////////////////////////////////////////////////////////
	
	function buildTweet(vote) {
		// Build the tweet DOM element
		var tweet;
		var date = Date.create(vote.created_at);
		tweet = '<h4>'+ vote.from_user_name;
		tweet += '<span class="username"> @' + vote.from_user + '</span> ';
		tweet += '<span class="time-ago">' + date.relative() + '</span> ';
		tweet += '</h4>';
		tweet += '<p>' + vote.text + '</p>';		
		tweet = twttr.txt.autoLink(tweet, {urlEntities: vote.entities.urls });
		return tweet;
	}
		
	ronpaul.on('child_added', function(result) {
	 	var vote = result.val();
		var element = $('#'+ronpaul.name());
		var tweet = buildTweet(vote);
		
		element.find('.tweets').prepend(
			'<div class="tweet">'+ tweet +'</div>'
		);
	});
	
	mittromney.on('child_added', function(result) {
	 	var vote = result.val();
		var element = $('#'+mittromney.name());
		var tweet = buildTweet(vote);
		
		element.find('.tweets').prepend(
			'<div class="tweet">'+ tweet +'</div>'
		);
	});

});