import * as url from 'url';
let __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replaceAll('images', 'auth');
__dirname = __dirname.slice(0, __dirname.length - 5) + '\auth';

export default {
    __dirname: __dirname,
    download_folder: "../images",
    check_exist_images_folder: "\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\DIGITAL\\Data",
    user_data_dir: "\\login",
    username: process.env.username_,
    password: process.env.password_,
    donwload_link: process.env.download_link,
    GOOGLE_SHEET_ID: '1p_2TOLmxGNJ1Ke_vdcqSu_OXMU1gtqzJcN3y0Gq2fHg',
    GOOGLE_RANGE_INPUT: 'Sheet1',
    GOOGLE_RANGE_OUTPUT: '1',
}