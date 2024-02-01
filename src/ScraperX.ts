import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import { applyRegex, compact, valuesNull } from './helpers.js';

export interface CrawlReturn {
    [key: string]: string;
}

const getWebsiteContents = async (url: string) => axios.get(url);

/**
 * Parse the selector to get the selector, data type and filter
 * @param selector: string
 * @returns { selector: string; dataType: string; filter: any[] }
 */
const parseSelector = (
    selector: string,
): { selector: string; dataType: string; filter: string[] } => {
    const split = applyRegex(/^([^|]+)((?:\|)([^|]+))?$/gm, selector, [0, 2]);

    const data: { filter: string[]; selector: string; dataType: string } = {
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
const applyDataType = (element: HTMLElement, dataType: string) => {
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
    static #globalFilters: Record<string, (...args: any[]) => void> = null;

    #data: string;
    #filters: Record<string, (...args: any[]) => void> = null;

    private constructor(data) {
        this.#data = data;
    }

    /**
     * Finds elements within the HTML content based on scope.
     * @param scope A CSS selector or scope within which to find elements.
     * @returns String of element content.
     */
    find(scope: string): string;
    /**
     * Finds elements within the HTML content based on scope and optional selectors.
     * @param scope A CSS selector or scope within which to find elements.
     * @param selectors Optional. A record of selectors for extracting specific data from found elements.
     * @returns An array of objects with scraped data.
     */
    find(scope: string, selectors: Record<string, string>): CrawlReturn[];

    find(scope: string, selectors?: Record<string, string>) {
        if (!selectors) {
            return this.getElementContent(parse(this.#data), scope);
        }

        return parse(this.#data)
            .querySelectorAll(scope)
            .reduce((acc: any, cur: HTMLElement) => {
                const c = compact(
                    Object.entries(selectors).map(([key, value]: any) => {
                        return {
                            [key]: this.getElementContent(cur, value),
                        };
                    }),
                );

                if (!valuesNull(c)) {
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
    async crawl(
        linkSelector: string,
        scope: string,
        selectors: Record<string, string>,
        maxPages: number = -1,
    ) {
        const accumulator = [] as CrawlReturn[];
        var page = 1;
        var nextUrl: string = null;

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
    setFilters(filters: Record<string, (...args: any[]) => void>) {
        this.#filters = filters;
    }

    /**
     * Applies a specified filter to the data.
     * @param data The data to be filtered.
     * @param filter The filter to apply.
     * @returns The filtered data.
     */
    private applyFilter = (data: string, filter: string[]): any => {
        const filters = this.#filters ?? ScraperX.#globalFilters;

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
    private getElementContent = (data: any, selector: string) => {
        const parsedSelector = parseSelector(selector);
        const element =
            parsedSelector.selector == '&'
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
    static html(html: string) {
        return new ScraperX(html);
    }

    /**
     * Creates scraper instance with `url` contents as data
     * @param url URL to scrape
     * @returns instance of ScraperX
     */
    static async url(url: string) {
        const html = (await getWebsiteContents(url)).data;

        return ScraperX.html(html);
    }

    /**
     * Finds elements within the HTML content based on scope.
     * @param html HTML to scrape
     * @param scope A CSS selector or scope within which to find elements.
     * @returns String of element content
     */
    static find(html: string, scope: string): string;

    /**
     * Finds elements within the HTML content based on scope and optional selectors.
     * @param html HTML to scrape
     * @param scope A CSS selector or scope within which to find elements.
     * @param selectors Optional. A record of selectors for extracting specific data from found elements.
     * @returns An array of objects with scraped data.
     */
    static find(
        html: string,
        scope: string,
        selectors: Record<string, string>,
    ): CrawlReturn[];

    static find(
        html: string,
        scope: string,
        selectors?: Record<string, string>,
    ): CrawlReturn[] | string {
        return ScraperX.html(html).find(scope, selectors);
    }

    /**
     * Finds elements within the HTML content based on scope.
     * @param url URL to scrape
     * @param scope A CSS selector or scope within which to find elements.
     * @returns String of element content
     */
    static async $find(url: string, scope: string): Promise<string>;
    /**
     * Finds elements within the HTML content based on scope and optional selectors.
     * @param url URL to scrape
     * @param scope A CSS selector or scope within which to find elements.
     * @param selectors Optional. A record of selectors for extracting specific data from found elements.
     * @returns An array of objects with scraped data.
     */
    static async $find(
        url: string,
        scope: string,
        selectors: Record<string, string>,
    ): Promise<CrawlReturn[]>;

    static async $find(
        url: string,
        scope: string,
        selectors?: Record<string, string>,
    ): Promise<CrawlReturn[] | string> {
        return (await ScraperX.url(url)).find(scope, selectors);
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
    static async crawl(
        html: string,
        linkSelector: string,
        scope: string,
        selectors: Record<string, string>,
        maxPages: number = -1,
    ) {
        return ScraperX.html(html).crawl(
            linkSelector,
            scope,
            selectors,
            maxPages,
        );
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
    static async $crawl(
        url: string,
        linkSelector: string,
        scope: string,
        selectors: Record<string, string>,
        maxPages: number = -1,
    ) {
        return (await ScraperX.url(url)).crawl(
            linkSelector,
            scope,
            selectors,
            maxPages,
        );
    }

    /**
     * Sets filters for processing scraped data.
     * @param filters A record of filter functions to be applied to scraped data.
     */
    static setGlobalFilters(filters: Record<string, (...args: any[]) => void>) {
        this.#globalFilters = filters;
    }
}
