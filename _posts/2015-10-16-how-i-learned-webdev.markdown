---
layout: post
title:  "How I learned webdev"
description: "a walkthrough my first steps as a web developer"
date:   2015-10-15 16:57:08 +0100
---

When built my first personal website, I didn't know how to run code on a remote host to listen to different endpoints and serve the respective content. Naturally, the result was a static website:

![png]({{ site.url }}/assets/images/how-i-learned-webdev/image1.png)

This has been my online profile since June, and the more I learned about web development the more I was stinged by the limitations of my website. Additionally, I realised that I'd been learning many interesting things that are worth sharing, so I decided to build a blog.

Using existing solutions like WordPress didn't seem very interesting to me as someone who wanted to understand his publishing platform. I wanted to spend time writing code to become a better programmer. Using pre-existing publishing platforms were, to me, the cheat option.

At the time I was about to take my Programming Applications exam, a module that taught us to use the Java Swing library to build desktop UI for our apps. And so I decided to build my content management client in Java.

![png]({{ site.url }}/assets/images/how-i-learned-webdev/image2.png)

As ugly as it is, it does exactly what I needed which is saving and editing my texts and pictures to a remote Mongo database. A small Express app fetched the data from the same database and served each image on it's own endpoint and each post with a jade templated view. Each post page had a form for comments which Express handled and saved. My Java client was also built to review and accept these pending comments.

![png]({{ site.url }}/assets/images/how-i-learned-webdev/image3.png)

# Learned lesson

![png]({{ site.url }}/assets/images/how-i-learned-webdev/image4.png)

It was definitely a step up from the first website but not without its problems. I was never happy with the design. I realised this was because I was taken away by the amazing resources I had found online such as wallpapers, color palettes, fonts and animations. I wanted to use all of it. Unsurprisingly, the end product was an incoherent collage with a lot of noise.

Another problem I felt I had was that I had only picked MongoDB because it's popular to use with Node and Express as part of the MEAN stack. As easy as I thought setting up MongoDB was, it can apparently [lose data](http://cryto.net/~joepie91/blog/2015/07/19/why-you-should-never-ever-ever-use-mongodb/). I also felt I had to discover the relational databases so I could have a better understanding of the storage tools available to a developer.

I also had not given any thought to how it'd be best to format my text. I was inserting HTML tags inside my string and when I discovered **Markdown** I realised this wasn't going to be a problem anymore.

As soon as I tried to solve these problems, I ran into the biggest realisation I've had while building my blog. I had written the code without any of consideration of my future self. All the code I have written until then was for coursework and hackathon projects, so shipping was the only goal. Once I had submitted it for review be it a demo pitch or a coursework deadline, I was never going to work on it again. **The biggest lesson of all was shifting from a bodge code mentality to a maintainable code focus. And this makes all the difference**.

I put this project on hold while I spent my Summer working with Red Badger. That was a great experience and it introduced me to a lot of new technologies and good practices. Once I finished the programme, I had learnt so much that it was very easy to scratch all previous work and build the whole thing again.

# Current code

![png]({{ site.url }}/assets/images/how-i-learned-webdev/image5.png)

I built my homepage with **React.js**. It is a front-end framework that bundles HTML into objects called Components. This is the Column Component from which all columns in the homepage inherit:

{% highlight jsx %}
import React from 'react/addons';
import CardComponent from '../Cards/CardComponent';

export default class ColumnComponent extend React.Component {
	static displayName = 'Column Component';

	constructor(props) {
		super(props);
	}

	getColumnClass() {
		return '';
	}

	renderCards() {
		return [1, 2, 3, 4, 5, 6, 7, 8].map((data) => {
			cards.push(<CardComponent num={data} key={data}/>);
		});
	}

	renderColumnHeader() {
		return (
			<div className="column-header">
				Title
			</div>
		);
	}

	render() {
		return (
			<div className={`column ${this.getColumnClass()}`}>
				{this.renderColumnHeader()}
				<div className="column-content">
					{this.renderCards()}
				</div>
			</div>
		);
	}
}
{% endhighlight %}

All subcolumns override the functions getColumnClass, renderCards and renderColumnHeader. The same is done with the cards. I wrote all of my Javascript with ES6, Javascript's next version. It brings easier syntax and features, I compile it with Babel.js.

As for the content management client, I ditched the Java and remade it with React, but since it's something only I was supposed to use, I made a desktop client. This was possible thanks to **Electron**. Built on top of Chromium's engine, it lets me run HTML views for Node.js processes, so my 'client' Javascript code can actually interact with Node.js and perform operations natively. It's awesome.

![png]({{ site.url }}/assets/images/how-i-learned-webdev/image6.gif)

The gif above show's how I'm able to drop an image to my editor and once the post has been created, the path to the image is replaced for a link to an **S3 host**. A challenge I had doing this was posting more than one image to AWS before I saved the post. I could easily identify the paths of images that needed to be uploaded thanks to a Markdown AST, but telling my code to only save the post once all of the images finished uploading was tricky because I didn't know how to make a loop iterate only when the async code inside the iteration was finished.

{% highlight javascript %}
let traverseTree = (tree, callback) => {
	// tree is the Markdown AST
	traverse(tree).forEach((node) => {
		// check if the node is not an array, is an object and is an image
		if(!Array.isArray(node) && typeof node === 'object' && node !== null
			&& node.type === 'image') {
				// uploadImage is the async code that uploads the image to S3
				uploadImage(node.href);
		}
	});
	// the callback is called even before the first image is uploaded
	callback();
}
{% endhighlight %}

The interpreter was executing the code after the for-loop right after reading it, before my images had been uploaded and so the post was saved with the local path. I solved this by using **Promises**.

{% highlight javascript %}
let traverseTree = (tree) => {
	return new Promise((resolve, reject) => {
		// map of the traverse will return an array of promises
		let promisesArray = traverse(tree).map((node) => {
			if(!Array.isArray(node) && typeof node === 'object' && node !== null
				&& node.type === 'image') {
					// uploadImage now returns a promise
					return uploadImage(node.href);
			}
		});
		// Once all of the promises inside is complete, call resolve
		Promise.all(promisesArray).then(resolve).catch(reject);
		});
};
{% endhighlight %}

# It is not finished

Having made my page maintainable means that the next time I have a new feature I want to implement I won't have to redo it again, but I will be able to build on top of this alpha version without being stressed about caveats I left behind. This takes more discipline when writing code but I quickly learned that good code is something you support, not something you bootstrap for a demo. It also means your time is vulnerable to whatever bug shows up on the system, but I'm happy to trade that for calling something of my own.

There's much more I can do to this site. Adding a comment form to the post, implementing the Flux architecture to my content management client or bringing GraphQL to my columns are a few examples of those things I want to do.

However, I want to take a break from web development and pick up on something I've been wanting to do for a while now, **data science**. This is mainly what I'm going to write about so pay attention to this space!
