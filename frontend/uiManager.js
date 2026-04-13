/**
 * UI management functions for DOM manipulation and updates
 */

/**
 * Show or hide a DOM element
 * @param {string} elementId - The ID of the element
 * @param {boolean} show - Whether to show (true) or hide (false)
 */
function setElementVisibility(elementId, show) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

/**
 * Get the currently selected option value from a dropdown
 * @param {string} dropdownId - The ID of the dropdown element
 * @returns {string} The selected value
 */
function getDropdownValue(dropdownId) {
  const element = document.getElementById(dropdownId);
  return element ? element.value : '';
}

/**
 * Set dropdown value
 * @param {string} dropdownId - The ID of the dropdown element
 * @param {string} value - The value to set
 */
function setDropdownValue(dropdownId, value) {
  const element = document.getElementById(dropdownId);
  if (element) {
    element.value = value;
  }
}

/**
 * Get input field value
 * @param {string} inputId - The ID of the input element
 * @returns {string} The input value
 */
function getInputValue(inputId) {
  const element = document.getElementById(inputId);
  return element ? element.value : '';
}

/**
 * Set input field value
 * @param {string} inputId - The ID of the input element
 * @param {string} value - The value to set
 */
function setInputValue(inputId, value) {
  const element = document.getElementById(inputId);
  if (element) {
    element.value = value;
  }
}

/**
 * Clear input field
 * @param {string} inputId - The ID of the input element
 */
function clearInput(inputId) {
  setInputValue(inputId, '');
}

/**
 * Set text content of an element
 * @param {string} elementId - The ID of the element
 * @param {string} text - The text content
 */
function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

/**
 * Enable or disable a button
 * @param {string} buttonId - The ID of the button
 * @param {boolean} enabled - Whether to enable (true) or disable (false)
 */
function setButtonState(buttonId, enabled) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = !enabled;
  }
}

/**
 * Get selected option text from dropdown
 * @param {string} dropdownId - The ID of the dropdown
 * @returns {string} The selected option text
 */
function getDropdownSelectedText(dropdownId) {
  const element = document.getElementById(dropdownId);
  if (element && element.selectedOptions.length > 0) {
    return element.selectedOptions[0].text;
  }
  return '';
}

/**
 * Get data attribute from selected option
 * @param {string} dropdownId - The ID of the dropdown
 * @param {string} dataAttribute - The name of the data attribute (without 'data-' prefix)
 * @returns {string|null} The attribute value
 */
function getSelectedOptionDataAttribute(dropdownId, dataAttribute) {
  const element = document.getElementById(dropdownId);
  if (element && element.selectedOptions.length > 0) {
    return element.selectedOptions[0].getAttribute(`data-${dataAttribute}`);
  }
  return null;
}

/**
 * Clear table body
 * @param {string} tableBodyId - The ID of the table body element
 */
function clearTableBody(tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  if (tbody) {
    tbody.innerHTML = '';
  }
}

/**
 * Show no data message in table
 * @param {string} tableBodyId - The ID of the table body element
 * @param {number} colspan - Number of columns to span
 * @param {string} message - The message to display
 */
function showTableNoData(tableBodyId, colspan, message = 'No transactions') {
  const tbody = document.getElementById(tableBodyId);
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="no-data-message">${message}</td></tr>`;
  }
}

/**
 * Insert a row into a table body
 * @param {string} tableBodyId - The ID of the table body element
 * @returns {HTMLTableRowElement} The newly inserted row
 */
function insertTableRow(tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  if (tbody) {
    return tbody.insertRow();
  }
  return null;
}

/**
 * Show dropdown option with icon and styling
 * @param {HTMLOptionElement} option - The option element
 * @param {string} icon - The icon to display
 * @param {boolean} isActive - Whether the option is active
 */
function updateDropdownOptionDisplay(option, icon, isActive) {
  if (!option) return;
  
  option.textContent = `${icon} ${option.value}`;
  
  if (isActive) {
    option.classList.add('active-month');
    option.classList.remove('inactive-month');
    option.style.backgroundColor = "#90EE90";
    option.style.color = "black";
  } else {
    option.classList.add('inactive-month');
    option.classList.remove('active-month');
    option.style.backgroundColor = "#D3D3D3";
    option.style.color = "gray";
  }
}

/**
 * Get all options from a dropdown
 * @param {string} dropdownId - The ID of the dropdown element
 * @returns {NodeList} The list of option elements with values
 */
function getDropdownOptions(dropdownId) {
  const element = document.getElementById(dropdownId);
  if (element) {
    return element.querySelectorAll("option[value]");
  }
  return [];
}

/**
 * Find option in dropdown by value
 * @param {string} dropdownId - The ID of the dropdown element
 * @param {string} value - The value to find
 * @returns {HTMLOptionElement|null} The option element or null
 */
function findDropdownOption(dropdownId, value) {
  const element = document.getElementById(dropdownId);
  if (element) {
    return element.querySelector(`option[value="${value}"]`);
  }
  return null;
}

/**
 * Set dropdown options from data
 * @param {string} dropdownId - The ID of the dropdown element
 * @param {Array} options - Array of option values
 * @param {string} defaultOption - The default option text
 */
function populateDropdown(dropdownId, options, defaultOption = '') {
  const element = document.getElementById(dropdownId);
  if (!element) return;
  
  element.innerHTML = defaultOption ? `<option value="">${defaultOption}</option>` : '';
  
  options.forEach(optionValue => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    element.appendChild(option);
  });
}
