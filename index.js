{
  const csvInput = document.csvform.csvinput;
  const jsonOutput = document.querySelector('.output');
  const copy = document.querySelector('.copy');
  let jsonStatus = document.querySelector('.status-text');
  let copyStatus = document.querySelector('.copy-status-text');
  let debounce = null;

  csvInput.addEventListener('keyup', function(e) {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const json = csvToJson(this.value);
      displayJson(json);
      jsonStatus = updateStatus(jsonStatus, 'JSON\'d');
    }, 100);
  });

  copy.addEventListener('click', function(e) {
    jsonOutput.select();
    document.execCommand('copy');
    this.focus();

    copyStatus = updateStatus(copyStatus, 'Copy\'d');
  });

  function updateStatus(element, text) {
    const newStatus = element.cloneNode();
    newStatus.className = "status-text pop";
    newStatus.textContent = text;
    element.parentNode.replaceChild(newStatus, element);
    setTimeout(() => {
      newStatus.classList.add('fade-out');
    }, 3000);
    return newStatus;
  }

  function displayJson(data) {
    jsonOutput.value = JSON.stringify(data, undefined, 2);
  }

  function csvToJson(csv) {
    const rows = csv.split(/\n/);
    const keys = rows.shift().split(',');
    const dataRows = rows.map(row => row.split(','));

    const jsonArray = [];
    dataRows.forEach(row => {
      const obj = {};

      row.forEach((cell, i) => {
        if (cell === 'TRUE') {
          obj[keys[i]] = true;
        } else if (cell === 'FALSE') {
          obj[keys[i]] = false;
        } else {
          obj[keys[i]] = cell;
        }
      });

      // check incomplete row or newline at end of csv file
      if (Object.keys(obj).length != keys.length) return;
      jsonArray.push(obj);
    });

    return jsonArray;
  }
}
