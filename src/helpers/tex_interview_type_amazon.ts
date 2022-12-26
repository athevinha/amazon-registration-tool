import fs from 'fs';
import { Browser, Page } from "puppeteer"
import check_and_action from '../libs/check_and_action.js';
import { setTimeout } from 'timers/promises';
class tex_interview_type_amazon {
    page: Page;
    browser: Browser;
    caa: check_and_action;
    constructor(page, browser) {
        this.page = page;
        this.browser = browser
        this.caa = new check_and_action(this.page, this.browser)
    }
    async start(kdp_account) {
        await setTimeout(5000)
        await this.caa.check_and_click('button#payee-save-button')
        await setTimeout(20000)
        await this.caa.check_and_click('button#argon-tax-interview-button')
        await setTimeout(20000)
        await this.caa.check_and_click('span#toggleButtonId_IndividualOrBusiness_Business')
        await setTimeout(5000)
        await this.caa.check_and_click('span#toggleButtonId_IsUSPersonBusiness_false')
        await setTimeout(5000)
        await this.caa.check_and_click('span#a-autoid-6')
        await setTimeout(5000)
        await this.caa.check_and_click('a#BeneficialOwnerTypeBusiness_0')
        await setTimeout(5000)
        await this.caa.check_and_click('span#toggleButtonId_IsIntermediaryAgent_false-announce')
        await setTimeout(5000)
        await this.caa.check_and_click('span#a-autoid-17-announce')
        await setTimeout(5000)
        await this.caa.check_and_click('a#CountryOfIncorporation_238')
        await setTimeout(5000)
        await this.caa.check_and_type('input[data-regex-message="Only alphabets(A - Z), numbers(0-9), hyphen(-), period(.), slash(/), parentheses () and spaces are allowed."]', kdp_account[2])
        await setTimeout(5000)
        await this.caa.check_and_click('button#a-autoid-32-announce')
        //next step 
        await setTimeout(5000)
        await this.caa.check_and_click('span#toggleButtonId_TreatyClaim9cYesNoVisible_true')
        await setTimeout(5000)
        await this.caa.check_and_click('span#a-autoid-88')
        await setTimeout(5000)
        await this.caa.check_and_click('a#LOBTypeGB_0')
        await setTimeout(5000)
        await this.caa.check_and_click('input[name="LOBReviewCertification"]')
        await setTimeout(5000)
        await this.caa.check_and_click('button#a-autoid-91-announce')
        await setTimeout(5000)
        await this.caa.check_and_click('input[name="SignatureCapacityForNonIndividualW8benE"]')
        await setTimeout(5000)
        await this.caa.check_and_type('input[name="ElectronicSignatureW8BenEName"]', kdp_account[3])
        await this.caa.check_and_click('button#a-autoid-111-announce')
        await setTimeout(20000)

        let isPassTax = await this.page.$('div#button_SaveAndPreviewButtonW8BenE > span')
        while (isPassTax) {

            await this.caa.check_and_click('input[name="NonUSPermAddressOverride"]')
            await this.caa.check_and_click('div#button_NonUSTaxIdentityInformationSectionSaveButton > span')
            await this.caa.check_and_click('div#button_TreatySectionSaveButton > span')
            await this.caa.check_and_click('div#button_SaveAndPreviewButtonW8BenE > span')
            await setTimeout(20000)
            isPassTax = await this.page.$('div#button_SaveAndPreviewButtonW8BenE > span')
        }
        await this.caa.check_and_click('div#button_SubmitButton')
        await setTimeout(5000)
        await this.caa.check_and_click('button#exit-button-id')
    }
}
export default tex_interview_type_amazon