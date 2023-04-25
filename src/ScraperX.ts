const axios = require('axios');
const { parse } = require('node-html-parser');
const { applyRegex, compact, valuesNull } = require('./helpers.js');

const ScraperX = () => {
    const getWebsiteContents = async (url: string) => axios.get(url);

    /**
     * Parse the selector to get the selector, data type and filter
     * @param selector: string
     * @returns { selector: string; dataType: string; filter: any[] }
     */
    const parseSelector = (
        selector: string
    ): { selector: string; dataType: string; filter: any[] } => {
        const split = applyRegex(
            /^([^|]+)((?:\|)([^|]+))?$/gm,
            selector,
            [0, 2]
        );

        const data: { filter: any; selector: string; dataType: string } = {
            selector: '',
            dataType: 'text',
            filter: []
        };

        if (split?.length == 2) {
            const filterArray = applyRegex(
                /^([^:]+)(?::)?([^:]+)?$/gm,
                split[1]
            );

            data.filter = [
                filterArray[0],
                ...(filterArray.length > 1
                    ? filterArray[1].replace('"', '').split(',')
                    : [])
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
    const applyDataType = (element: any, dataType: string) => {
        switch (dataType) {
            case 'text':
                return element.textContent;
            case 'html':
                return element.outerHTML;
            default:
                return element.getAttribute(dataType);
        }
    };

    const applyFilter = (data: string, filter: string[]): any => {
        const f: any = filter.shift();
        return filters[f](data, ...filter);
    };

    /**
     * Get content from element based on the selector
     * @param data
     * @param selector
     * @returns
     */
    const getElementContent = (data: any, selector: string) => {
        const parsedSelector = parseSelector(selector);
        const element =
            parsedSelector.selector == 'current'
                ? data
                : data.querySelector(parsedSelector.selector);

        if (!element) {
            return null;
        }

        data = applyDataType(element, parsedSelector.dataType);

        if (parsedSelector.filter.length > 0) {
            data = applyFilter(data, parsedSelector.filter);
        }

        return data;
    };

    /**
     * Content Filters
     */
    let filters: any = {};

    const scraperx = (url: string, scope: string, selectors?: any): any => {
        const crawl = async (
            url2?: string,
            pagination?: string,
            maxPages = -1,
            accumulator: any = [],
            page = 1
        ): Promise<[]> => {
            const finalUrl = url2 || url;

            const pageContents = finalUrl.toLowerCase().startsWith('http')
                ? (await getWebsiteContents(finalUrl)).data
                : finalUrl;

            if (!selectors) {
                return getElementContent(parse(pageContents), scope);
            }
            const parsedPageContents = scope
                ? parse(pageContents).querySelectorAll(scope)
                : parse(pageContents).querySelectorAll('');

            const filteredContents = parsedPageContents.reduce(
                (acc: any, cur: any) => {
                    const c = compact(
                        Object.entries(selectors).map(([key, value]: any) => {
                            return {
                                [key]: getElementContent(cur, value)
                            };
                        })
                    );

                    if (!valuesNull(c)) {
                        acc.push(c);
                    }

                    return acc;
                },
                []
            );

            /**
             * If pagination is not set, directly return filtered contents
             */
            if (!pagination) {
                return filteredContents;
            }

            accumulator.push(...filteredContents);

            /**
             * If maxPages is set, check if the limit is reachedq
             */
            if (maxPages != -1 && page >= maxPages) {
                return accumulator;
            }

            page += 1;
            const nextUrl = getElementContent(parse(pageContents), pagination);

            /**
             * If paginate element is not found, return the accumulator
             */
            if (!nextUrl) {
                return accumulator;
            }

            return await crawl(
                nextUrl,
                pagination,
                maxPages,
                accumulator,
                page
            );
        };

        crawl.paginate = async (paginate: string, maxPages: number) => {
            // Implement pagination
            return await crawl(url, paginate, maxPages);
        };

        return selectors ? crawl : crawl();
    };

    scraperx.setFilters = (newFilters: any) => {
        filters = newFilters;
    };

    return scraperx;
};

module.exports = ScraperX;
