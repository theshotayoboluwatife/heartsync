// Debug script to find the development message
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Log all console messages
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.type(), msg.text());
  });
  
  // Log all network requests
  page.on('request', request => {
    console.log('REQUEST:', request.url());
  });
  
  try {
    await page.goto('https://trustmarch.com/profile');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Search for development text
    const devText = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      const results = [];
      while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes('développement') || 
            node.textContent.toLowerCase().includes('development')) {
          results.push({
            text: node.textContent,
            parent: node.parentElement.tagName,
            parentClass: node.parentElement.className
          });
        }
      }
      return results;
    });
    
    console.log('DEVELOPMENT TEXT FOUND:', devText);
    
    // Get page source
    const content = await page.content();
    console.log('PAGE CONTAINS DEV BANNER:', content.includes('replit-dev-banner'));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();