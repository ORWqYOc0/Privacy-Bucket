
Object.prototype.hasOwnProperty = function(property) {
    return typeof(this[property]) !== 'undefined'
};

// quick and dirty url parser
// this doesn't actually work for all domains - we will have to fix it
function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    var domsplits = a.hostname.split(".");
    var dom = domsplits[domsplits.length-2]+"."+domsplits[domsplits.length-1];
    return ret = {
        source: url,
        protocol: a.protocol.replace(':',''),
        hostdomain: dom
    };
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

var hostpage = parseURL(document.location).hostdomain;

var thirdparties = [];

///Here we will make an array called "ads"

var ads = [];

var adsizes = [160600,600160,300600,600300,300250,250300,72890,90728,180150,150180];
//550280,280550
//92450,50924

///////////////////////// CHANGES FOR $FREE /////////////////////////
// We're going to cut out all parsing of scripts - all 
// We're going to need to add the array of ad sizes, and then look for all DOM items that are of those sizes, divs, images, etc.

//Determine number of requests for IAB standard ad sizes (160x600, 300x600, 300x250, 728x90, 180x150 - http://www.iab.net/guidelines/508676/508767/displayguidelines)

// then we're going to want to run each through our value calculator and then store the resulting $ value
// leter we're going to need to sum total the values as well as conect it to the display.

//////////////////////////////////////////////////////////////////////

// look for script elements with foreign src domains
scrEls = document.getElementsByTagName("script");
for(var el in scrEls) {

    var curhost = parseURL(scrEls[el].src).hostdomain;
    if(hostpage != curhost && !contains(thirdparties,curhost)) thirdparties.push(curhost);
}

// look for img elements with foreign src domains
imgEls = document.getElementsByTagName("img");
for(var el in imgEls) {

    // Does this image match the dimensions we care about
    // I'm doing this is a non-optimal way.  Tough. I know I should just multiple w & h. 
    imgsize = (imgEls[el].naturalWidth * 1000) + imgEls[el].naturalHeight;

    //console.log("Enter image ad check script: " + imgsize);

    if(contains(adsizes,imgsize)) {
        ads.push(curhost)
        //console.log("YO: I just saw an image ad from: "+curhost)
    } 
    
    var curhost = parseURL(imgEls[el].src).hostdomain;
    if(hostpage != curhost && !contains(thirdparties,curhost)) thirdparties.push(curhost);
    
}


frameEls = document.getElementsByTagName("iframe");
for(var el in frameEls) {

    var currhost = parseURL(frameEls[el].src).hostdomain;

    //frameheight = frameEls[el].height;
    //framewidth = frameEls[el].width;
    //framesize = frameheight + framewidth;

    framesize = frameEls[el].width + frameEls[el].height;
    
    //console.log("Yo: I just saw an iframe from" + currhost + " and it's fz:" + framesize);

    framesize = parseInt(framesize);
    if(contains(adsizes,framesize)) {
        ads.push(curhost)
        //console.log("Yo: I FOUND AN IFRAME AD!");
    }

    // Still need to make the above functions and recurse through the iframes
}

// Add embed tags for flash
embedEls = document.getElementsByTagName("embed");
for(var el in embedEls) {

    var currhost = parseURL(embedEls[el].src).hostdomain;

    embedsize = embedEls[el].width + embedEls[el].height;
    embedsize = parseInt(embedsize);
    if(contains(adsizes,embedsize)) {
        ads.push(currhost);
        //console.log("Yo: found an embded" + embedsize);
    }

}

// send a message to our background script containing all the third parties we witnessed
chrome.extension.sendRequest({thirdparties: thirdparties, hostpage: parseURL(document.location.toString()).hostdomain});


console.log("Ads found from: " + ads);

// send the message for the ads seen:
chrome.extension.sendRequest({ads: ads, hostpage: parseURL(document.location.toString()).hostdomain});

// todo: iframes

// another caveat: trackers can be embedded in iframes.
// we may need to do a recursive traversal of iframes.

// another possible way, use the chrome experimental request hooking api:
// http://code.google.com/chrome/extensions/trunk/experimental.webRequest.html
