import { Browser, Page } from "puppeteer";
import { setTimeout } from "timers/promises";
class check_and_action {
    page: Page;
    browser: Browser;

    constructor(page, browser) {
        this.page = page;
        this.browser = browser;
    }
    check_isset_element = async (element: string = '') => {
        try {
            if (!!(await this.page.$(element))) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    check_and_click = async (element: string) => {
        await this.page.waitForSelector(element);
        if (await this.check_isset_element(element)) {
            await this.page.click(element);
        }
        await setTimeout(2000);
    }

    check_and_type = async (element: string, value: string) => {
        await this.page.waitForSelector(element);
        if (await this.check_isset_element(element)) {
            await this.page.type(element, value);

        }
        await setTimeout(2000);
    }
}


export default check_and_action