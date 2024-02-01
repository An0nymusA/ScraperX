import axios from 'axios';
import { parse } from 'node-html-parser';
import { applyRegex, compact, valuesNull } from './helpers.js';
const getWebsiteContents = async (url) => axios.get(url);
/**
 * Parse the selector to get the selector, data type and filter
 * @param selector: string
 * @returns { selector: string; dataType: string; filter: any[] }
 */
const parseSelector = (selector) => {
    const split = applyRegex(/^([^|]+)((?:\|)([^|]+))?$/gm, selector, [0, 2]);
    const data = {
        selector: '',
        dataType: 'text',
        filter: [],
    };
    if (split?.length == 2) {
        const filterArray = applyRegex(/^([^:]+)(?::)?([^:]+)?$/gm, split[1]);
        data.filter = [
            filterArray[0],
            ...(filterArray.length > 1
                ? filterArray[1].replace('"', '').split(',')
                : []),
        ];
    }
    data.selector = split[0].split('@')[0];
    data.dataType = split[0].split('@')[1] || 'text';
    return data;
};
/**
 * Get the data from the element based on the data type
 * @param element
 * @param dataType
 * @returns
 */
const applyDataType = (element, dataType) => {
    switch (dataType) {
        case 'text':
            return element.textContent;
        case 'html':
            return element.outerHTML;
        default:
            return element.getAttribute(dataType);
    }
};
export class ScraperX {
    static globalFilters = null;
    static filterNonNullValues = true;
    #data;
    #filters = null;
    constructor(data) {
        this.#data = data;
    }
    find(scope, selectors) {
        if (!selectors) {
            return this.getElementContent(parse(this.#data), scope);
        }
        return parse(this.#data)
            .querySelectorAll(scope)
            .reduce((acc, cur) => {
            const c = compact(Object.entries(selectors).map(([key, value]) => {
                return {
                    [key]: this.getElementContent(cur, value),
                };
            }));
            if (!ScraperX.filterNonNullValues || !valuesNull(c)) {
                acc.push(c);
            }
            return acc;
        }, []);
    }
    /**
     * Crawls through paginated data, scraping content based on provided selectors.
     * @param linkSelector A CSS selector for the link to the next page.
     * @param scope A CSS selector or scope within which to find elements on each page.
     * @param selectors A record of selectors for extracting specific data from found elements.
     * @param maxPages Optional. The maximum number of pages to crawl (-1 for no limit).
     * @returns An array of objects with scraped data from all crawled pages.
     */
    async crawl(linkSelector, scope, selectors, maxPages = -1) {
        const accumulator = [];
        var page = 1;
        var nextUrl = null;
        while (maxPages == -1 || page <= maxPages) {
            const scraper = nextUrl ? await ScraperX.url(nextUrl) : this;
            accumulator.push(...scraper.find(scope, selectors));
            page += 1;
            nextUrl = this.find(linkSelector);
            /**
             * If paginate element is not found, return the accumulator
             */
            if (!nextUrl) {
                return accumulator;
            }
        }
        return accumulator;
    }
    /**
     * Sets filters for processing scraped data.
     * @param filters A record of filter functions to be applied to scraped data.
     */
    setFilters(filters) {
        this.#filters = filters;
    }
    /**
     * Applies a specified filter to the data.
     * @param data The data to be filtered.
     * @param filter The filter to apply.
     * @returns The filtered data.
     */
    applyFilter = (data, filter) => {
        const filters = this.#filters ?? ScraperX.globalFilters;
        if (!filters) {
            return data;
        }
        const f = filter.shift();
        return filters[f](data, ...filter);
    };
    /**
     * Extracts content from an element based on the provided selector.
     * @param data The element or parsed HTML to extract data from.
     * @param selector The CSS selector or custom selector for identifying the element.
     * @returns The content extracted from the specified element or null if not found.
     */
    getElementContent = (data, selector) => {
        const parsedSelector = parseSelector(selector);
        const element = parsedSelector.selector == '&'
            ? data
            : data.querySelector(parsedSelector.selector);
        if (!element) {
            return null;
        }
        data = applyDataType(element, parsedSelector.dataType);
        if (parsedSelector.filter.length > 0) {
            data = this.applyFilter(data, parsedSelector.filter);
        }
        return data;
    };
    /**
     * Creates scraper instance with `html` as data
     * @param html HTML to scrape
     * @returns instance of ScraperX
     */
    static html(html) {
        return new ScraperX(html);
    }
    /**
     * Creates scraper instance with `url` contents as data
     * @param url URL to scrape
     * @returns instance of ScraperX
     */
    static async url(url) {
        const html = (await getWebsiteContents(url)).data;
        return ScraperX.html(html);
    }
    static find(html, scope, selectors) {
        const scraper = ScraperX.html(html);
        return selectors ? scraper.find(scope, selectors) : scraper.find(scope);
    }
    static async $find(url, scope, selectors) {
        const scraper = await ScraperX.url(url);
        return selectors ? scraper.find(scope, selectors) : scraper.find(scope);
    }
    /**
     * Crawls through paginated data, scraping content based on provided selectors.
     * @param html HTML to scrape
     * @param linkSelector A CSS selector for the link to the next page.
     * @param scope A CSS selector or scope within which to find elements on each page.
     * @param selectors A record of selectors for extracting specific data from found elements.
     * @param maxPages Optional. The maximum number of pages to crawl (-1 for no limit).
     * @returns
     */
    static async crawl(html, linkSelector, scope, selectors, maxPages = -1) {
        return ScraperX.html(html).crawl(linkSelector, scope, selectors, maxPages);
    }
    /**
     * Crawls through paginated data, scraping content based on provided selectors.
     * @param url URL to scrape
     * @param linkSelector A CSS selector for the link to the next page.
     * @param scope A CSS selector or scope within which to find elements on each page.
     * @param selectors A record of selectors for extracting specific data from found elements.
     * @param maxPages Optional. The maximum number of pages to crawl (-1 for no limit).
     * @returns
     */
    static async $crawl(url, linkSelector, scope, selectors, maxPages = -1) {
        return (await ScraperX.url(url)).crawl(linkSelector, scope, selectors, maxPages);
    }
}
//# sourceMappingURL=ScraperX.js.map