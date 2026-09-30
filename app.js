
const BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies"
const dropdowns = document.querySelectorAll(".dropdown select");
const button =  document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

window.addEventListener("load" , () =>{
    updateExchangeRate();
});

for(let select of dropdowns){
    for(let currCode in countryList){
        let newOption = document.createElement("Option");
        newOption.innerText = currCode;
        newOption.value = currCode;
        if(select.name ==="from" && currCode === "USD"){
            newOption.selected = "selected";
        } else if(select.name ==="to" && currCode === "PKR"){
            newOption.selected = "selected";
        }
        select.append(newOption);
    }
    select.addEventListener("change" , (evt) =>{
        updateFlag(evt.target);
    });
}
//searchable dropdown 
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const specialNames = {
  EUR: "Euro",
  XOF: "West African CFA",
  XAF: "Central African CFA",
  XPF: "CFP Franc",
  XCD: "East Caribbean",
  NOK: "Norway",
  ANG: "Netherlands Antilles",
};
// Search ke liye extra naam (list mein nazar nahi aayenge)
const searchWords = {
  EUR: "germany spain italy france netherlands belgium austria portugal ireland greece finland luxembourg croatia slovakia slovenia estonia latvia lithuania malta cyprus europe european union",
  USD: "america usa ecuador el salvador panama puerto rico",
  XOF: "senegal mali ivory coast benin burkina faso togo niger guinea-bissau",
  XAF: "cameroon chad gabon congo equatorial guinea",
  XCD: "antigua dominica grenada saint lucia saint kitts",
  GBP: "england britain uk scotland wales",
  AED: "dubai abu dhabi uae emirates",
  SAR: "saudi arabia ksa",
};
const getLabel = (code) => {
  let name = specialNames[code];      
  if (!name) {
    name = regionNames.of(countryList[code]);  
  }
  return name + " (" + code + ")";
};

const allCodes = Object.keys(countryList);
allCodes.sort((a, b) => {
  return getLabel(a).localeCompare(getLabel(b));
});

const setupDropdown = (box) => {
  const select = box.querySelector("select");   
  let firstCode = "";                           
  const display = document.createElement("div");
  display.className = "dd-display";
  display.innerText = select.value;
  const panel = document.createElement("div");
  panel.className = "dd-panel";
  panel.innerHTML =
    '<input class="dd-search" type="text" placeholder="Search country or code...">' +
    '<ul class="dd-list"></ul>';

  box.append(display);
  box.append(panel);

  const search = panel.querySelector(".dd-search");
  const list = panel.querySelector(".dd-list");
  const closePanel = () => {
    box.classList.remove("open");
  };

  const chooseCountry = (code) => {
    select.value = code;        
    updateFlag(select);         
    display.innerText = code;   
    closePanel();
  };
  const showList = (searchText) => {
    const text = searchText.trim().toLowerCase();
    list.innerHTML = "";        
    firstCode = "";
    let found = 0;

    for (let code of allCodes) {
      const label = getLabel(code);

     const extra = searchWords[code] || "";
      const searchable = (label + " " + extra).toLowerCase();

      if (searchable.includes(text)) { 
        const li = document.createElement("li");
        li.innerText = label;

        if (code === select.value) {
          li.classList.add("active");   
        }

        li.addEventListener("click", () => {
          chooseCountry(code);
        });

        list.append(li);

        if (found === 0) {
          firstCode = code;     
        }
        found = found + 1;
      }
    }
    if (found === 0) {
      list.innerHTML = '<li class="dd-empty">No country found</li>';
    }
  };

  const openPanel = () => {
    const allBoxes = document.querySelectorAll(".selectContainer");
    for (let b of allBoxes) {
      b.classList.remove("open");
    }

    box.classList.add("open");
    search.value = "";
    showList("");
    search.focus();

    const active = list.querySelector(".active");
    if (active) {
      list.scrollTop = active.offsetTop - 100;
    }
  };
  display.addEventListener("click", () => {
    if (box.classList.contains("open")) {
      closePanel();
    } else {
      openPanel();
    }
  });

  search.addEventListener("input", () => {
    showList(search.value);
  });

  // Enter aur Esc keys
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();               
      if (firstCode !== "") {
        chooseCountry(firstCode);       
      }
    }
    if (e.key === "Escape") {
      closePanel();
    }
  });
};

const allSelectBoxes = document.querySelectorAll(".selectContainer");
for (let box of allSelectBoxes) {
  setupDropdown(box);
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".selectContainer")) {
    const allBoxes = document.querySelectorAll(".selectContainer");
    for (let b of allBoxes) {
      b.classList.remove("open");
    }
  }
});

const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let imageSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = imageSrc;
    console.log(countryCode);
};

button.addEventListener("click" , (evt) => {
    evt.preventDefault();
    updateExchangeRate();
});

const updateExchangeRate = async() =>{
        let amount = document.querySelector(".amount input");
    let amtValue = amount.value;
    if (amtValue === "" || amtValue < 1){
        amtValue = 1;
        amount.value = "1";
    }

    const from = fromCurr.value.toLowerCase();
    const to = toCurr.value.toLowerCase();
    // console.log(fromCurr.value , toCurr.value);
    const URL = `${BASE_URL}/${from}.json`;
    let response = await fetch(URL);
    let data = await response.json();
    let rate = data[from][to];
    console.log(rate);

    let finalAmount = amtValue*rate;
    msg.innerText = `${amtValue} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
}