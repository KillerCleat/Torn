// ==UserScript==
// @name         Torn Plushie and Flower Set Counter
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Displays the number of complete plushie and flower sets in your display and what is missing to complete a set on specified pages in Torn.
// @author       KillerCleat [2842410]
// @match        https://www.torn.com/item.php*
// @match        https://www.torn.com/display.php*
// @match        https://www.torn.com/displaycase.php*
// @match        https://www.torn.com/imarket.php*
// @match        https://www.torn.com/bazaar.php*
// @match        https://www.torn.com/trade.php*
// @grant        none
// ==/UserScript==

/*
   INSTRUCTIONS:
   1. Replace 'YOUR_API_KEY_HERE' with your actual Torn API key.
   2. Set the target number of sets you want to collect by changing the 'targetSetQuantity' variable.
*/

(function() {
    'use strict';

    // ======= CONFIGURATION =======
    const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your Torn API key
    const targetSetQuantity = 250; // Set the target number of sets you want to collect
    // ============================

    // **********Don't modify code past this point*************

    // API URL to fetch display data
    const displayUrl = `https://api.torn.com/user/?selections=display&key=${apiKey}&comment=TryItPage`;

    // Flower set items (match exactly with the API response)
    const flowerSet = [
        'African Violet', 'Banana Orchid', 'Ceibo Flower', 'Cherry Blossom', 'Crocus',
        'Dahlia', 'Edelweiss', 'Heather', 'Orchid', 'Peony', 'Tribulus Omanense'
    ];

    // Plushie set items (match exactly with the API response)
    const plushieSet = [
        'Camel Plushie', 'Chamois Plushie', 'Jaguar Plushie', 'Kitten Plushie', 'Lion Plushie',
        'Monkey Plushie', 'Nessie Plushie', 'Panda Plushie', 'Red Fox Plushie', 'Sheep Plushie',
        'Stingray Plushie', 'Teddy Bear Plushie', 'Wolverine Plushie'
    ];

    // Function to fetch data from the display API
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log('Fetched Data:', data); // Debugging log to see fetched data
            return data.display || [];
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    // Function to count complete sets
    function countCompleteSets(items, set, targetQuantity = 1) {
        let minCount = Infinity;
        set.forEach(item => {
            const matchingItem = items.find(i => i.name === item);
            const count = matchingItem ? Math.floor(matchingItem.quantity / targetQuantity) : 0;
            console.log(`Counting item: ${item}, Found: ${count}`); // Debugging log to see item counts
            if (count < minCount) {
                minCount = count;
            }
        });
        return minCount === Infinity ? 0 : minCount;
    }

    // Function to find missing items for the target set
    function findMissingItems(items, set, targetQuantity) {
        let missingItems = [];
        set.forEach(item => {
            const matchingItem = items.find(i => i.name === item);
            const count = matchingItem ? matchingItem.quantity : 0;
            if (count < targetQuantity) {
                missingItems.push(`${item}: ${targetQuantity - count}`);
            }
        });
        return missingItems;
    }

    // Function to display the number of complete sets and missing items
    async function displaySetCounts() {
        const displayItems = await fetchData(displayUrl);

        // Calculate the number of complete flower and plushie sets
        const flowerSetCount = countCompleteSets(displayItems, flowerSet);
        const plushieSetCount = countCompleteSets(displayItems, plushieSet);

        // Find missing items to complete the target sets
        const missingFlowerItems = findMissingItems(displayItems, flowerSet, targetSetQuantity);
        const missingPlushieItems = findMissingItems(displayItems, plushieSet, targetSetQuantity);

        // Create a container for the result
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '35px'; // Adjusted placement
        container.style.right = '10px';
        container.style.padding = '10px';
        container.style.backgroundColor = '#333';
        container.style.color = '#fff';
        container.style.borderRadius = '5px';
        container.style.zIndex = '1000';
        container.style.fontSize = '14px';
        container.style.maxHeight = '300px';
        container.style.overflowY = 'auto';

        // Display the counts and missing items
        container.innerHTML = `
            <strong>Complete Sets:</strong><br>
            Flowers: ${flowerSetCount}<br>
            Plushies: ${plushieSetCount}<br><br>
            <strong>Missing Items for ${targetSetQuantity} Set:</strong><br>
            Flowers:<br> ${missingFlowerItems.join('<br>')}<br>
            Plushies:<br> ${missingPlushieItems.join('<br>')}
        `;

        // Append the container to the body
        document.body.appendChild(container);
    }

    // Run the script on the specified pages
    if (
        window.location.href.includes('/item.php') ||
        window.location.href.includes('/display.php') ||
        window.location.href.includes('/displaycase.php') ||
        window.location.href.includes('/imarket.php') ||
        window.location.href.includes('/bazaar.php') ||
        window.location.href.includes('/trade.php')
    ) {
        displaySetCounts();
    }
})();
