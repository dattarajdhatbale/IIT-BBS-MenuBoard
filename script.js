const SHEET_URL = "https://opensheet.elk.sh/1hjmikrz6rW5QtAJCfE88hxGlqA8N6Nq5SG4Is8qHOGs/Sheet1";
let sheetData = [];

async function fetchSheetData() {
    try{
        const res= await fetch(SHEET_URL);
        sheetData= await res.json();
        console.log("Sheet loaded:", sheetData);
    } catch(e){
        console.log("Sheet load error");
    }
}

/* ---------- Theme (Default = Light) ---------- */
(function () {
    const saved = localStorage.getItem("theme");
    const theme = saved ? saved : "light";
    document.documentElement.setAttribute("data-theme", theme);
    updateInstaIcon(theme);
})();

function toggleTheme(){
    const html=document.documentElement;
    const newTheme= html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateInstaIcon(newTheme);
}

function updateInstaIcon(theme){
    const icon = document.getElementById("instaIcon");
    if (theme === "dark") {
        icon.src = "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/instagram-white-icon.png";
    } else {
        icon.src = "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/black-instagram-icon.png";
    }
}
/* Auto Today */
(function(){
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        document.getElementById("daySelect").value = today;
})();

function showMenu(){
    const btn = document.querySelector(".primary-btn");
    btn.disabled = true ;
     if (sheetData.length === 0) {
        document.getElementById("menuContent").innerHTML =
            "<div class='loader'>Loading menu...</div>";
        btn.disabled = false;
        return;
    }
    const selection= document.getElementById("selectionCard");
    const menuCard= document.getElementById("menuCard");
    const menuContent= document.getElementById("menuContent");
    const menuHeader= document.getElementById("menuHeader");

    selection.classList.add("fade-out");

    setTimeout(()=> {
        selection.classList.add("hidden");
        menuCard.classList.remove("hidden");

        const hall= document.getElementById("hallSelect").value;
        const day= document.getElementById("daySelect").value;

        menuHeader.innerText = hall + " • " + day;
        const data = sheetData.find(
            row => row.Hall.trim() === hall && row.Day.trim() === day
        );
        if(!data){
            menuContent.innerHTML="<div class='loader'>Menu not uploaded yet</div>";
            btn.disabled=false;
            return;
        }
        
        menuContent.innerHTML = `
            <div class="meal">
                <div class="meal-title">Breakfast</div>
                <div class="meal-value">${data.Breakfast}</div>
            </div>
            <div class="meal">
                <div class="meal-title">Lunch</div>
                <div class="meal-value">${data.Lunch}</div>
            </div>
            <div class="meal">
                <div class="meal-title">Dinner</div>
                <div class="meal-value">${data.Dinner}</div>
            </div>
        `;
        btn.disabled=false;
    },300);
}
function goBack() {
    const selection= document.getElementById("selectionCard");
    const menuCard= document.getElementById("menuCard");

    menuCard.classList.add("hidden");
    selection.classList.remove("hidden");
    selection.style.opacity=1;

    setTimeout(()=>{
        selection.classList.remove("fade-out");
    },50);
}
fetchSheetData();
