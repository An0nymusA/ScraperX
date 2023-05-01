# ScraperX
NodeJs web scraper with ability to crawl
## Installation
```
npm i https://github.com/An0nymusA/ScraperX
```
``` javascript
import ScraperX from 'scraperx';
const ScraperX = require('scraperx');
```
## Usage
### Selectors
There are 2+ types of content we can get from element
``` javascript
selector@text // will get text content of element
selector@html // will get outer html of element
selector@attr // will get value of attribute you specify
```
### Pagination
``` javascript
scraper(url, selector, {}).paginate(selector, maxPages)
// The contents of selector will be used for navigation to next page
// scraper will crawl until -> selector does not exist | maxPages has ben fulfilled
```
### Single usage
``` javascript
scraper("<html>"|"url.com", "selector")
```
### Mass usage
``` javascript
// if parentSelectors is "div", all child selectors will be "div selector"
scraper("<html>"|"url.com", "parentsSelector", {
    key1: "selector1",
    key2: "selector2",
    // if we want to get for example id of current parent
    id: "current@id"
}).paginate() 
```
## Filters
``` javascript
scraper.setFilters({
    trim: (str) => str.trim(),
    replace: (str, search, replace) => str.replace(search, replace || '')
})

// filter can be applied in two ways
// "selector | filter" or "selector | filter:arg1,arg..."

```
### Example
``` javascript
const scraper = ScraperX();
const url = 'https://example.com'
const html = '<div><span id="a" >Span Text </span></div>' // Can be used instead of url for testing

scraper(html, 'span#a') // "Span  Text "
scraper(html, 'span#a | trim') // "Span Text"
scraper(html, 'span#a | replace:Span,Div') // "Div Text "
```
