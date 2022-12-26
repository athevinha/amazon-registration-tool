import fs from 'fs';
import path from 'path';
import { Browser, Page } from "puppeteer"
class capture_screen_shots {
    page: Page;
    browser: Browser;
    constructor(page, browser) {
        this.page = page;
        this.browser = browser
    }
    async capture(name_image: string) {
        // if screenshots directory is not exist then create one
        if (!fs.existsSync("screenshots")) {
            fs.mkdirSync("screenshots");
        }

        let browser = null;

        try {
            // capture screenshot and store it into screenshots directory.
            const path_img = path.join('\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\DIGITAL\\KDP_CAPTURE\\', `${name_image}.jpeg`)
            await this.page.screenshot({ path: `${path_img}` });
            return path_img

        } catch (err) {
            console.log(`Error: ${err.message}`)
            return err?.message;
        } finally {
        }
    }
}
export default capture_screen_shots