const axios = require('axios');
const cheerio = require('cheerio');

async function testCA(barNumber) {
    console.log(`Testing CA Bar for ${barNumber}...`);
    try {
        const url = `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${barNumber}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000 
        });

        const $ = cheerio.load(response.data);
        console.log("Page loaded. Checking selectors...");
        const statusText = $('#content #primary #status').text().trim() || $('#content p:contains("Status:")').text().trim() || $('b:contains("Status:")').parent().text();
        console.log("Status text found:", statusText);
        
        let isVerified = false;
        if (statusText && statusText.toLowerCase().includes('active')) {
            isVerified = true;
        }
        
        if(response.data.includes('Active') && !response.data.includes('No record found')) {
            isVerified = true;
        }

        const name = $('#content #primary h3').text().trim() || $('h3').first().text().trim();
        console.log("Name found:", name);
        console.log("Verified:", isVerified);
    } catch (err) {
        console.error("CA Error:", err.message);
    }
}

async function testTX(barNumber) {
    console.log(`Testing TX Bar for ${barNumber}...`);
    try {
        const searchUrl = `https://www.texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer&template=/Customsource/MemberDirectory/Search_Form_Client_Main.cfm`;
        const response = await axios.post(searchUrl, `BarNumber=${barNumber}&Submit=Search`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        let isVerified = false;
        const resultRow = $('.search-results .row');
        console.log("Result rows found:", resultRow.length);
        
        let name = "";
        if (resultRow.length > 0 || response.data.includes('Eligible to Practice')) {
             isVerified = true;
             name = $('.search-results h2').text().trim();
        } else if (response.data.includes('Eligible To Practice In Texas')) {
             isVerified = true;
        }
        console.log("Verified:", isVerified);
        console.log("Name:", name);
    } catch (err) {
        console.error("TX Error:", err.message);
    }
}

testCA('146672');
testTX('15649200');
