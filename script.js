const mealsEl=document.getElementById('meals');
const favoriteContainer=document.getElementById("fav-meals");

const searchBtn = document.getElementById("search");
const searchTerm = document.getElementById("search-term");

const mealInfoEl=document.getElementById("meal-info");
const mealPopup=document.getElementById("meal-popup");
const popupCloseBtn=document.getElementById("close-popup");
getRandomMeal();        //7
fetchFavMeals();         //82

async function getRandomMeal(){
    const resp=await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    
    const respData=await resp.json();
    const randomMeal=respData.meals[0];

    addMeal(randomMeal,true);
}
async function getMealById(id){
    const resp=await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    const respData=await resp.json();
    const meal=respData.meals[0];
    return meal;
}
async function getMealsBySearch(term){
    const resp= await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" +term);
    
    const respData = await resp.json();

    console.log(respData);
    const meals = respData.meals;

    console.log(meals);
    
    return meals;

}
function addMeal(mealData,random=false){

    console.log(mealData);

    const meal=document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML=`
    <div class="meal-header">
    ${random ? `
    <span class="random"> Random Recipe</span>`:''}
    <img src="${mealData.strMealThumb}"
         alt="${mealData.strMeal}"
    />

    </div>
    <div class="meal-body">
    <h4>${mealData.strMeal}</h4>
    <button class="fav-btn">
        <i class="fa fa-heart">

        </i>
    </button>
    </div>
    `;
    
    //获取heart按钮标签
    const btn=meal.querySelector(".meal-body .fav-btn");
    btn.addEventListener("click",()=>{
        if(btn.classList.contains("active")){
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        }else{
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }
        fetchFavMeals();
    });


    meal.querySelector(".meal-header").addEventListener("click",()=>{
        showMealInfo(mealData);

    })
    meals.appendChild(meal);

}



function addMealLS(mealId){
    const mealIds=getMealsLS();
    localStorage.setItem("mealIds",JSON.stringify([...mealIds,mealId]));

}
function removeMealLS(mealId){
    const mealIds=getMealsLS();
    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id)=>id !== mealId))
    );
}
function getMealsLS(){
    const mealIds=JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;

}

async function fetchFavMeals(){

   //clean the container
   favoriteContainer.innerHTML="";
    
    const mealIds=getMealsLS();

    for(let i=0;i<mealIds.length;i++){
        const mealId=mealIds[i];
        meal=await getMealById(mealId);
        
        addMealFav(meal);
    }
    //console.log(meals);

    //add them to the screem
}
function addMealFav(mealData){


    const favMeal=document.createElement("li");

    favMeal.innerHTML=`
    <img class="fav-img" src="${mealData.strMealThumb}" 
         alt="${mealData.strMeal}"/>
        <span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas 
        fa-window-close"></i></button>
    `;
    console.log(favMeal);
    const btn=favMeal.querySelector('.clear');
    btn.addEventListener("click",()=>{
        removeMealLS(mealData.idMeal);
        fetchFavMeals();
    });
    favMeal.querySelector(".fav-img").addEventListener("click",()=>{
        showMealInfo(mealData);
    })
    
    favoriteContainer.appendChild(favMeal);

}
function showMealInfo(mealData){

    mealInfoEl.innerHTML="";

    const mealEl = document.createElement("div");
    const ingredients=[];

    for(let i=1;i<=20;i++){
        if(mealData["strIngredient"+i]){
            ingredients.push(`${mealData["strIngredient"+i]}
            / ${mealData["strMeasure"+i]}`)
        }else{
            break;
        }
    }
    mealEl.innerHTML = `
         <h1>${mealData.strMeal}</h1>
         <img src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:<h3>
        <ul>
             ${ingredients.map( (ing) => `<li>${ing}</li>`).join("")}
        </ul>
    
    `;
    console.log(mealEl);
    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click",async ()=>{

    mealsEl.innerHTML=``;
    const search = searchTerm.value;
    console.log(await getMealsBySearch(search));

    const meals = await getMealsBySearch(search);

    if(meals){
        meals.forEach((meal)=>{
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener("click",()=>{
    mealPopup.classList.add("hidden");
})