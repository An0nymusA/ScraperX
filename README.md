# ScraperX

NodeJs web scraper with ability to crawl

## Installation

```
npm i https://github.com/An0nymusA/ScraperX
```

```javascript
import { ScraperX } from 'scraperx';
```

## Usage

### Selectors

There are 2+ types of content we can get from element

```javascript
selector@text // will get text content of element
selector@html // will get outer html of element
selector@attr // will get value of attribute you specify
```

### Pagination

```javascript
ScraperX.html('...').crawl(linkSelector, scope ,selectors, maxPages?);
// The contents of selector will be used for navigation to next page
// scraper will crawl to max page, or until there is a valid link
```

### Single usage

```javascript
ScraperX.html('<p>Lorem Ipsum</p>', 'p@text').find('p@text');
(await ScraperX.url('https://google.com', 'p@text')).find('p@text');
```

```javascript
ScraperX.find('<p>Lorem Ipsum</p>', 'p@text');
ScraperX.$find('https://google.com', 'p@text');
```

### Mass usage

```javascript
// if parentSelectors is "div", all child selectors will be "div selector"
ScraperX.html('...').find('div', {
    title: 'p.title@text',
    subtitle: 'p.subtitle@text',
    link: 'a@href',
});
```

### Filters

```javascript
//Global filters
ScraperX.setFilters({
    trim: (str) => str.trim(),
    replace: (str, search, replace) => str.replace(search, replace || ''),
});

//Instance specific Filters
scraper.setFilters({
    trim: (str) => str.trim(),
    replace: (str, search, replace) => str.replace(search, replace || ''),
});

// filter can be applied in two ways
// "selector | filter" or "selector | filter:arg1,arg..."
```

### Example

```javascript
const url = 'https://example.com';
const html = '<div><span id="a" >Span Text </span></div>'; // Can be used instead of url for testing

ScraperX.find(html, 'span#a'); // "Span Text "
ScraperX.find(html, 'span#a | trim'); // "Span Text"
ScraperX.find(html, 'span#a | replace:Span,Div'); // "Div Text "
```
