
Avoid using inline styling, make sure to use css classes for consistency.

Any calls directly to API can only be done in the utility js file. All functions in other js files which needs the API should call a function in the utility file. ONLY the utility file calls directly to the API.

When building ui elements and layout, group feature related component together so it’s simple to move from one UI mode to the next.

Any time Ajax is used, check any possible UI components which might need to be updated and update UI as needed.

main.js should have only high level logic and event related logic, and initialization of page. any utility function should be in an adjucate file (for example, date manipulation should be in its own file, string manipulation also)