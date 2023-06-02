const categoriesSelect = document.querySelector('#categorias');
const result = document.querySelector('#resultado');
const favDiv = document.querySelector('.favoritos');
const modal = new bootstrap.Modal('#modal', {});

window.onload = function(){

    if(categoriesSelect){
        categoriesSelect.addEventListener('change', showRecipes);
        getCategories();
    }

    if(favDiv){
        getFavs()
    } 
}


function showRecipes(){
    const value = categoriesSelect.value;
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${value}`)
        .then(result => result.json())
        .then(data => recipes(data.meals))

}

function recipes(recipes){
    clear(result);

    const heading = document.createElement('H2');
    heading.classList.add('text-center', 'text-black', 'my-5');
    heading.textContent = recipes.length ? 'Resultados' : 'No hay resultados';
    result.appendChild(heading)


    recipes.forEach(recipe => {
        const {idMeal, strMeal, strMealThumb} = recipe
        const recipeContainer = document.createElement('DIV');
        recipeContainer.classList.add('col-md-4');

        const recipeCard = document.createElement('DIV');
        recipeCard.classList.add('card', 'mb-4');

        const recipeImagen = document.createElement('IMG');
        recipeImagen.classList.add('card-img-top');
        recipeImagen.alt = `Imagen de la receta ${strMeal ?? recipe.title}`;
        recipeImagen.src = strMealThumb ?? recipe.img;
        
        const recipeCardBody = document.createElement('DIV');
        recipeCardBody.classList.add('card-body');
        

        const recipeHeading = document.createElement('H3');
        recipeHeading.classList.add('card-title', 'mb-3');
        recipeHeading.textContent = strMeal ?? recipe.title;

        const recipeButton = document.createElement('BUTTON');
        recipeButton.classList.add('btn' , 'btn-danger', 'w-100');
        recipeButton.textContent = 'Ver Receta';
        //recipeButton.dataset.bsTarget = '#modal';
        //recipeButton.dataset.bsToggle = 'modal';
        recipeButton.onclick = function(){
            selectRecipe(idMeal ?? recipe.id)
        }

        recipeCardBody.appendChild(recipeHeading);
        recipeCardBody.appendChild(recipeButton);

        recipeCard.appendChild(recipeImagen);
        recipeCard.appendChild(recipeCardBody);

        recipeContainer.appendChild(recipeCard);

        result.appendChild(recipeContainer);
    });
}

function selectRecipe(id){
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
        .then(result => result.json())
        .then(data => showRecipeModal(data.meals[0]))
}

function showRecipeModal(recipe){
    // Show modal
    const {idMeal, strInstructions, strMeal, strMealThumb} = recipe;
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body');

    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"></img>
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y Cantidades</h3>
    
    `;

    const listGroup = document.createElement('UL');
    listGroup.classList.add('list-group');

    for(let i = 1; i < 20; i++){
        if(recipe[`strIngredient${i}`]){
            const ingredient = recipe[`strIngredient${i}`];
            const quantity = recipe[`strMeasure${i}`];

            const li = document.createElement('LI');
            li.classList.add('list-group-item');
            li.textContent = `${ingredient} - ${quantity}`;

            listGroup.appendChild(li);
        }
    }
    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector('.modal-footer');
    clear(modalFooter)

    // Buttons
    const btnFav = document.createElement('button');
    btnFav.classList.add('btn', 'btn-danger', 'col');
    btnFav.textContent = storageExist(idMeal) ? 'Eliminar de Favoritos' : 'Guardar en Favoritos'


    //LocalStorage
    btnFav.onclick = function(){

        if(storageExist(idMeal)){
            deleteFav(idMeal);
            
            btnFav.textContent = 'Guardar Favorito';
            showToast('Eliminado correctamente');
            
            return
        }else{
            btnFav.textContent = 'Eliminar de Favoritos'
        }


        addFav({
            id: idMeal,
            title: strMeal,
            img: strMealThumb
        })
        showToast('Agregado correctamente');
    }

    const btnClose = document.createElement('button');
    btnClose.classList.add('btn', 'btn-secondary', 'col');
    btnClose.textContent = 'Cerrar';
    btnClose.onclick = function(){
        modal.hide();
    }
    
    modalFooter.appendChild(btnFav);
    modalFooter.appendChild(btnClose);

    // Show modal
    modal.show()
}

function getCategories(){
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    fetch(url)
        .then(result => result.json())
        .then(data => showOptions(data))
}


function showOptions(data){
    const {categories} = data;

    categories.forEach(element => {
        
        const option = document.createElement('option');
        option.value = element.strCategory;
        option.textContent = element.strCategory;
        categoriesSelect.appendChild(option);
    });
}


function addFav(recipe){
    const fav = JSON.parse(localStorage.getItem('favourites')) ?? [];
    localStorage.setItem('favourites', JSON.stringify([...fav, recipe]));
}

function deleteFav(id){
    const fav = JSON.parse(localStorage.getItem('favourites')) ?? [];
    const newFav = fav.filter(fav => fav.id !== id);
    localStorage.setItem('favourites', JSON.stringify(newFav));
    recipes(newFav);
}

function storageExist(id){
    const fav = JSON.parse(localStorage.getItem('favourites')) ?? [];
    return fav.some(fav => fav.id === id);
}

function showToast(message){
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastDiv);
    toastBody.textContent = message;
    toast.show();

}

function getFavs(){
    const fav = JSON.parse(localStorage.getItem('favourites')) ?? [];
    if(fav.length){
        recipes(fav);
        return;
    }

    const noFavs = document.createElement('p');
    noFavs.textContent = 'No hay favoritos';
    noFavs.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
    favDiv.appendChild(noFavs);

}

function clear(select){
    while(select.firstChild){
        select.removeChild(select.firstChild);
    }
}