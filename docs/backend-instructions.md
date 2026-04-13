This includes API and DB.

Any change to data scheme (add new property for example to data object) you MUST go over DB scheme and all API methods, ensure all align with the scheme in full.

API calls in the utility js file must be wrapped with try catch. The catch MUST print the error to console.

any logic related to the api MUST be in the api util file.

