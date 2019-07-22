---
layout: post
title:  "Primer on Recommendation Engines"
description: "build one with R Studio"
date: 2015-11-09 16:57:08 +0100
---

Amazon used to employ people to recommend readers the books they might be interested in reading next. Not only that wasn't going to scale well, but when they automated the process of making recommendations, sales had a significant boost.

![png]({{ site.url }}/assets/images/primer-on-recommendations/image1.png)

<span class="img-caption">My amazon recommendations</span>

You've probably forgotten by now, but the [Netflix](http://techblog.netflix.com/2012/06/netflix-recommendations-beyond-5-stars.html) frontpage became popular overnight because it was loaded with a selection of film categories that was made specifically to entice you. They even ran a [million dollar competition](http://netflixprize.com/) to improve their recommendation algorithm. Their recommendations set them apart.

![png]({{ site.url }}/assets/images/primer-on-recommendations/image2.png)

<span class="img-caption">I've never used Netflix to watch Community or Rick and Morty, yet they've correctly guessed I'm a Dan Harmon fan!</span>

[Spotify](http://www.slideshare.net/MrChrisJohnson/algorithmic-music-recommendations-at-spotify) knows you won't stop listening if they can follow up with the right tune. Similarly, YouTube videos are now left on autoplay by default.

We thought we were giving movies and books 1 to 5 ratings to broadcast our tastes, but that was just a ploy to get us to give them a clue on what to push for sale (now imagine what Facebook could do with all of your likes).

You might feel you're subconsciously losing agency to algorithmic overlords that will influence your choices perpetually. You are right, but this is how things have become and more the reason why [we have to stay vigilant](http://new.spectator.co.uk/2015/10/we-let-programmers-run-our-lives-so-hows-their-moral-code/) If you know how they work then you might feel more at ease and easily detect anything suspicious. We do it with Google's search algorithms, why not Amazon's recommendations?

# Ingredients

Depending on the the type of data the system has access to, the workings of a recommendation engine can vary. In general, there's three main streams of data you can feed to your platform.

**Personalized recommendation** is achieved by inspecting records regarding a specific user. This can include explicit vectors such as movie ratings, age or location, or implicit ones determined by behaviour. For example, skipping songs. The ammount of information services can have about one user is enormous, it can extend to the point in which input for algorithms include what time of the day you check your finances.

**Social recommendation** still uses user's data but places him in a collective context. This can be her group of friends or users who have purchased the same items.

**Item recommendation** is achieved by using information about the items themselves. This is often used in a browsing context, where an algorithm searches for products familiar to the object currently being looked at. Again, the metadata is limited to how the architect builds his information to describe a class of items. It can be as simple as registering language, genre, topic and length of a book, or it can go as far as trying to build a collection of genes to tag music with, which is what music streaming service [Pandora](https://www.pandora.com/about/mgp) does.

Obviously, you don't necessarily have to compromise to only one kind of data. In fact, all successful platforms use a combination of every kind of data they can use to make the best guess. However, there are different techniques.

# Collaborative Filtering

In this article I will be going through the **collaborative filtering** technique. It goes through the user preferences of many items to help them collaborate with each other and predict what someone in specific would rate a selected item. Its premise is that if two people have the same bias towards something, then the probability they will rate something else similarly will be higher.

So the key here is to find how similar two users are. Each person will have a similarity score relative to each other. Here's two ways to find this number.

The **Euclidean distance** is the distance of two people given their preferences. Suppose we have two items X and Y and two people A and B. A has given item X a rating of 2 out of 5 and to item Y, a 4. On the other hand, user B has rated X with a 3 and Y a 2. Using their X and Y preferences, we can place them in a two dimensional plane.

![png]({{ site.url }}/assets/images/primer-on-recommendations/image3.png)

<span class="img-caption">Euclidean distance graph</span>

The distance between the two points is obtained by applying the pythagorean principle. The shorter the distance, the more similar they are. A function that calculates the similarity score should iterate through every item they have both rated, collect their preferences and calculate the overall distance. However, the similarity score is to be proportional to the relatedness, so we need to inverse this given number.

The **Pearson correlation** also uses a preference space, only in this case each axis represents a user and the points an item where their coordinates are the rating given by each person. Say two users X and Y rate 5 items A, B, C, D and E with [3, 3, 2, 5, 4] and [4, 3, 3, 1, 2] respectively. It renders the following graph:

![png]({{ site.url }}/assets/images/primer-on-recommendations/image4.png)

<span class="img-caption">Pearson correlation graph</span>

You can see I also plotted a line of best fit. This line is that one that comes as close to all points as possible. If two users had the same ratings for every item this line would touch all points, so the Pearson score is determined by how close this line comes to every point. Although correlation formula is not as intuitive as the distance formula, [tutorials](http://www.statisticshowto.com/what-is-the-pearson-correlation-coefficient/) are widely available since it's a fundamental concept for applied statistics. The formula should return a value between -1 and 1 where -1 means both users have opposite tastes and 1 is their tastes are exactly the same.

The Pearson correlation is slightly more complicated, hence computationally more expensive, but it will correct for grade inflation. If one critic tends to give out harsher scores than the rest, the correlation will normalize the grades and bring it down to a consistent scale. It is always better to try as many algorithms as possible to see which one is more accurate. You can also look into the coefficient de communauté or the Manhattan distance, they all have a their own advantages.

# Hands on

Now that we know how to find a similarity score, we can start writing the program that will do this for us. I've been going through R tutorials at [DataCamp](http://www.faure.hu/blog/www.datacamp.com), so I took the challenge of implementing these algorithms in R. Most of it is straightforward and I've made sure to comment lines where a step is given so the whole process is clear.

Before we start, make sure you have the R binary and R Studio in your systems. We are going to be using public data from [MovieLens](https://movielens.org/). You can download the compressed .zip file [here](http://files.grouplens.org/datasets/movielens/ml-100k.zip).

The first thing you want to do is inspect what you have. The uncompressed folder contains a variety of text files. If you go over the README file, you'll learn that it contains 100k movie ratings given by 943 different users to a variety of 1628 films (among other columns of data). The ratings are specified in the u.data file. Its first column contains the ID of the user who rated the film. This movie's code is in the second column. The rating is in the third column. The last column represents the POSIX time since it's been created.

This table alone should be enough, but if we want to use the names of the films, we're going to use the u.item file too. This set contains more columns that includes release date and genres but we since we only need the ID of the movie and its name, we need only to pay attention to the first and second columns.

Once this is clear, we can load the files into our R environment. For this, you need to start R Studio and familiriase yourself with the interface. You will probably find three panes. The largest one on the left side is the console. The other two are your environment are your files viewer, on top and bottom of your left side.

![png]({{ site.url }}/assets/primer-on-recommendations/image5.png)

<span class="img-caption">R Studio when just opened</span>

Click 'Import Dataset' on the environment tab, select 'From Text File...'. Select the u.data file you just downloaded and when prompted, change the name of the data frame to something more appropriate. I chose to name it 'ratings'. You can now click on the import button.

Before actually importing the u.item table, I'd like you to try and preview the data frame by loading the text file but not importing it. You will notice that the rows are probably not tabulated because the selected separator is set to 'Tabs'. Regardless of anything you choose, none of the listed separators work because this text file has line columns separated by pipe characters. You are going to have to replace those with something R Studio can interpret. The other options are to split the lines by whitespace, comma, or semicolon characters. Since our film names can contain whitespace or commas, semicolons are the best choice.

There's different ways to replace specific characters on files. I used the following command on my OSX terminal:

{% highlight bash %}
$ sed -i '' -e 's/|/;/g' ./path/to/file/_u.item
{% endhighlight %}

Now you can finish loading the file. I named my u.item table 'movies'. You can use the console to play around with these two tables. Try logging 'movies', 'ratings[2]', or whatever you feel like.

It's important we have it easy when dealing with this data, so we should name the columns at least for the ratings table. You can do this by using the colnames function. Call the following lines in the console.

{% highlight bash %}
> column_names <- c("user_id", "movie_id", "rating", "timestamp")
> colnames(ratings) <- column_names
{% endhighlight %}

Try the results by logging ratings or ratings$user_id.

Your environment is now properly set up and ready to call some functions. Go to File > New File > R Script and an blank text editor should come up. Here's the function for calculating the Euclidean distance similarity score:

{% highlight r %}
# Returns Euclidean Distance Score between user1 and user2
euclidean <- function(ratings_data, users, user1, user2) {
	# Get the users column from the data
	users <- ratings_data$user_id

	#Retrieve the users and their rated movies
	first_user <- ratings_data[users == user1,]
	first_movies <- first_user$movie_id
	second_user <- ratings_data[users == user2,]
	second_movies <- second_user$movie_id

	squares <- vector()

	#Loop through both sets of movies
		for (movie1 in first_movies) {
		for(movie2 in second_movies) {
			#Check if both users have rated the same movies
			if(movie1 == movie2) {
				#Retrieve the rating each gave to the film
				first_rating <- first_user[first_movies == movie1,]$rating
				second_rating <- second_user[second_movies == movie2,]$rating

				# Push the square of the difference
				squares <- c(squares, (first_rating-second_rating)^2)
			}
		}
	}

	# Return 0 if they haven't both rated any film
	if(length(squares) == 0) {
		return(0)
	}

	# Get the sum of the squares
	squares_sum <- sum(squares)

	# Return the score
	1/(1+sqrt(squares_sum))
}

{% endhighlight %}

To call this function, you need to load the script to your environment. Do this by pressing the Source option on the right side of the text editor toolbar. Now that 'euclidean' is available in your environment, you can call it.

{% highlight r %}
> euclidean(ratings, users, 1, 2)
{% endhighlight %}

This will give you the similarity score between users with ids 1 and 2. To test if the function actually works, you can try feeding the same users to the function, it should return a similarity score of 1.

Here's the code for the Pearson correlation function:

{% highlight r %}
# Returns Pearson Correlation between user1 and user2
pearson <- function(ratings_data, user1, user2) {

	users <- ratings_data$user_id

	first_user <- ratings_data[users == user1,]
	first_movies <- first_user$movie_id
	second_user <- ratings_data[users$user_id == user2,]
	second_movies <- second_user$movie_id

	rated <- vector()

	for (movie1 in first_movies) {
		for(movie2 in second_movies) {
			#This time, if both rated same film then push the movie into rated vector
			if(movie1 == movie2) {
				rated <- c(rated, movie1)
			}
		}
	}

	length <- length(rated)
	if(length == 0) {
		return(0)
	}

	# Get the ratings
	first_ratings <- first_user[first_movies %in% rated,]$rating
	second_ratings <- second_user[second_movies %in% rated,]$rating

	# Sum of ratings
	first_sum <- sum(first_ratings)
	second_sum <- sum(second_ratings)

	# Sum of squares of ratings
	first_sq <- sum(first_ratings^2)
	second_sq <- sum(second_ratings^2)

	# sum of product of ratings
	product_sum <- sum(first_ratings*second_ratings)

	# Calculate the Pearson score and return
	num <- product_sum-(first_sum*second_sum/length)
	den <- sqrt((first_sq-(first_sum^2)/length)*(second_sq-(second_sum^2)/length))
	num/den
}
{% endhighlight %}

This function has the same signature as the previous one, so you call and test it just the same way.

{% highlight r %}
> pearson(ratings, 1, 2)
{% endhighlight %}

Alright, now we have similarity scores but can we actually recommend films to a user? Not quite there yet. We can tell to what extent people are similar to each other, and this can be used to finish the recommender.

You can choose to go through the most similar critics and their favorite films until there's one movie you haven't seen yet. But sometimes one similar user can like a film when other similar ones have disliked it. To avoid this, we are going to give each movie a score.

To obtain the recommendation score of a movie, we are going to take the rating each other person gave to the film and multiply it by the similarity score of this person to obtain a weighted score. The sum of all weighted scores would be a very accurate score if it wasn't for the fact that some movies have been rated more than others, so we are going to divide it by the total of similarity scores. This will give our most correct recommendation score.

{% highlight r %}
# Returns films from movies_list sorted by recommendation in descending order
recommend <- function(ratings_data, movies_list, user, sim_function) {

  users <- ratings_data$user_id

  # Create arrays for the weighted and numeric scores
  weighted <- numeric(nrow(movies_list))
  sim_sums <- numeric(nrow(movies_list))

  # Get the user ratings
  user_ratings <- ratings_data[users == user,]
  # Get the list of movies rated by the user
  user_movies <- user_ratings$movie_id

  # Loop the list of users
  for(other in unique(users)) {

    # Skip if the user is the same one
    if(other == user) {
      next()
    }

    #Get the similarity score
    sim <- sim_function(ratings, user, other)
    # If score is 0 or negative, ignore this critic
    if(sim <= 0) {
      next()
    }

    # Obtain the ratings made by the other user
    other_ratings <- ratings_data[users == other,]

    # Loop through the ratings of the other user
    for(i in 1:nrow(other_ratings)) {
      entry <- other_ratings[i,]

      # Get the rate the user has given this film
      user_rated <- user_ratings$rating[entry$movie_id == user_movies]
      # Determine if the user rating for this film doesn't exist
      rate_unexist <- length(user_rated) == 0
      # Determine if the user rating for this film is 0
      rate_empty <- if(rate_unexist) TRUE else user_rated == 0

      # Check if the user has not rated this film yet (unexistant or equal to 0)
      if (rate_unexist | rate_empty) {
        # Log to visualize progress
        print(entry)
        # Collect the total and weighted scores
        weighted[entry$movie_id] <- weighted[entry$movie_id] + entry$rating*sim
        sim_sums[entry$movie_id] <- sim_sums[entry$movie_id] + sim
      }
    }
  }

  # Get the ranking for each film
  rankings <- list()
  for(i in 1:length(weighted)) {
    # Get the name of the film
    movie_name <- as.character(levels(movies[,2]))[i]
    # Save recommendation score to name key
    rankings[[movie_name]] <- weighted[i]/sim_sums[i]
  }

  # Sort rankings in descending order and return
  rankings[order(unlist(rankings), decreasing=TRUE)]
}
{% endhighlight %}

You call this function by passing it the ratings table, the movies table, the ID of the user to be recommended and the name of the similarity function you want to use. I recommend you to save it to a variable so you can inspect the result closely.

{% highlight r %}
> recommendation_list <- recommend(ratings, movies, 1, euclidean)
{% endhighlight %}

This function take noticeably much longer to complete, which is why I have placed a logger inside the nested loop. It takes three minutes in my late 2013 Macbook Pro and it is the most I have been able to optimise without using dedicated libraries or apply functions. This code does go over a lot of stuff and it's much better than my first draft which took over 9 minutes. You're very welcome to improve it, if you do please let me know so I can update this with proper credits.

Now that you have the recommendation_list, you can inspect it. Try to see which are the top 20 recommended films for the user by calling recommendation_list[1:20].

{% highlight r %}
> recommendation_list[1:20]
$`Prophecy II, The (1998)`
[1] 5

$`Kika (1993)`
[1] 5

$`Paper, The (1994)`
[1] 5

$`Quiet Man, The (1952)`
[1] 5

$`Secret Adventures of Tom Thumb, The (1993)`
[1] 5

$`That Darn Cat! (1997)`
[1] 5

$`Tin Drum, The (Blechtrommel, Die) (1979)`
[1] 5

$`True Romance (1993)`
[1] 5

$`Walking Dead, The (1995)`
[1] 5

$`Wooden Man's Bride, The (Wu Kui) (1994)`
[1] 5

$`T-Men (1947)`
[1] 4.701408

$`Star Trek: The Motion Picture (1979)`
[1] 4.658359

$`Bad Girls (1994)`
[1] 4.612912

$`Winter Guest, The (1997)`
[1] 4.597661

$`Parent Trap, The (1961)`
[1] 4.571487

$`Psycho (1960)`
[1] 4.554834

$`Desperado (1995)`
[1] 4.550819

$`Wings of Desire (1987)`
[1] 4.513099

$`Extreme Measures (1996)`
[1] 4.499746

$`Sound of Music, The (1965)`
[1] 4.489382
{% endhighlight %}

Awesome stuff.

The accuracy of the recommendation engine can only be validated by the recommendees themselves. Ask them to continue rating films and see if their ratings match. Alternatively, you can remove a single rating from the user, run the recommendation engine and see if the recommendation score of the detached film matches the original one.

# Want more?

Recommendation engines come in many forms and many people rate their efficiency using different metrics. I hope that with this short tutorial you have gained the basic knowledge to start experimenting with recommenders.

If you are interested in learning more about recommendation engines, I recommend you get your hands on [Programming Collective Intelligence](http://www.amazon.co.uk/Programming-Collective-Intelligence-Building-Applications/dp/0596529325) by Toby Segaran. One chapter covers everything we've learned today and the rest of the book has more introductions to equally interesting topics.
