export interface CrawlReturn {
    [key: string]: string;
}
export declare class ScraperX {
    #private;
    private constructor();
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
    /**
     * Crawls through paginated data, scraping content based on provided selectors.
     * @param linkSelector A CSS selector for the link to the next page.
     * @param scope A CSS selector or scope within which to find elements on each page.
     * @param selectors A record of selectors for extracting specific data from found elements.
     * @param maxPages Optional. The maximum number of pages to crawl (-1 for no limit).
     * @returns An array of objects with scraped data from all crawled pages.
     */
    crawl(linkSelector: string, scope: string, selectors: Record<string, string>, maxPages?: number): Promise<CrawlReturn[]>;
    /**
     * Sets filters for processing scraped data.
     * @param filters A record of filter functions to be applied to scraped data.
     */
    setFilters(filters: Record<string, (...args: any[]) => void>): void;
    /**
     * Applies a specified filter to the data.
     * @param data The data to be filtered.
     * @param filter The filter to apply.
     * @returns The filtered data.
     */
    private applyFilter;
    /**
     * Extracts content from an element based on the provided selector.
     * @param data The element or parsed HTML to extract data from.
     * @param selector The CSS selector or custom selector for identifying the element.
     * @returns The content extracted from the specified element or null if not found.
     */
    private getElementContent;
    /**
     * Creates scraper instance with `html` as data
     * @param html HTML to scrape
     * @returns instance of ScraperX
     */
    static html(html: string): ScraperX;
    /**
     * Creates scraper instance with `url` contents as data
     * @param url URL to scrape
     * @returns instance of ScraperX
     */
    static url(url: string): Promise<ScraperX>;
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
    static find(html: string, scope: string, selectors: Record<string, string>): CrawlReturn[];
    /**
     * Finds elements within the HTML content based on scope.
     * @param url URL to scrape
     * @param scope A CSS selector or scope within which to find elements.
     * @returns String of element content
     */
    static $find(url: string, scope: string): Promise<string>;
    /**
     * Finds elements within the HTML content based on scope and optional selectors.
     * @param url URL to scrape
     * @param scope A CSS selector or scope within which to find elements.
     * @param selectors Optional. A record of selectors for extracting specific data from found elements.
     * @returns An array of objects with scraped data.
     */
    static $find(url: string, scope: string, selectors: Record<string, string>): Promise<CrawlReturn[]>;
    /**
     * Crawls through paginated data, scraping content based on provided selectors.
     * @param html HTML to scrape
     * @param linkSelector A CSS selector for the link to the next page.
     * @param scope A CSS selector or scope within which to find elements on each page.
     * @param selectors A record of selectors for extracting specific data from found elements.
     * @param maxPages Optional. The maximum number of pages to crawl (-1 for no limit).
     * @returns
     */
    static crawl(html: string, linkSelector: string, scope: string, selectors: Record<string, string>, maxPages?: number): Promise<CrawlReturn[]>;
    /**
     * Crawls through paginated data, scraping content based on provided selectors.
     * @param url URL to scrape
     * @param linkSelector A CSS selector for the link to the next page.
     * @param scope A CSS selector or scope within which to find elements on each page.
     * @param selectors A record of selectors for extracting specific data from found elements.
     * @param maxPages Optional. The maximum number of pages to crawl (-1 for no limit).
     * @returns
     */
    static $crawl(url: string, linkSelector: string, scope: string, selectors: Record<string, string>, maxPages?: number): Promise<CrawlReturn[]>;
    /**
     * Sets filters for processing scraped data.
     * @param filters A record of filter functions to be applied to scraped data.
     */
    static setGlobalFilters(filters: Record<string, (...args: any[]) => void>): void;
}
